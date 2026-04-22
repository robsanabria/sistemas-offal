from flask import Flask, request, jsonify
from datetime import datetime
import requests
import os
import json
import threading
import time
from dotenv import load_dotenv
import logging
from logging.handlers import RotatingFileHandler

# =========================
# CONFIGURACIÓN
# =========================
load_dotenv()

HUMAND_BASE = os.getenv("HUMAND_BASE")
HUMAND_TOKEN = os.getenv("HUMAND_TOKEN")

DRY_RUN = False              # ← poner False para pasar a productivo
SEND_INTERVAL_SECONDS = 60

ENTRADA_DEVICE = "Facial Entrada"
SALIDA_DEVICE = "Facial Salida"

LOG_FILE = "hik_webhook.log"
LOG_MAX_BYTES = 5 * 1024 * 1024   # 5 MB
LOG_BACKUP_COUNT = 5              # 5 archivos históricos

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Basic {HUMAND_TOKEN}"
}

app = Flask(__name__)

# =========================
# LOGGER
# =========================
logger = logging.getLogger("hik_webhook")
logger.setLevel(logging.INFO)

handler = RotatingFileHandler(
    LOG_FILE,
    maxBytes=LOG_MAX_BYTES,
    backupCount=LOG_BACKUP_COUNT,
    encoding="utf-8"
)

formatter = logging.Formatter(
    "[%(asctime)s] [%(levelname)s] %(message)s"
)

handler.setFormatter(formatter)
logger.addHandler(handler)

# También loguea en consola
console = logging.StreamHandler()
console.setFormatter(formatter)
logger.addHandler(console)

# =========================
# ESTADOS EN MEMORIA
# =========================
eventos_pendientes = []
eventos_procesados = set()
lock = threading.Lock()

# =========================
# ENVÍO A HUMAND
# =========================
def enviar_a_humand(tipo, employee_id, timestamp_iso):
    if DRY_RUN:
        logger.info(f"[DRY-RUN] {tipo} | DNI {employee_id} | {timestamp_iso}")
        return
    if not HUMAND_BASE:
        logger.error("[CONFIG] HUMAND_BASE not set; skipping send to Humand")
        return

    endpoint = (
        "/public/api/v1/time-tracking/entries/clockIn"
        if tipo == "Entrada"
        else "/public/api/v1/time-tracking/entries/clockOut"
    )

    url = HUMAND_BASE + endpoint

    body = {
        "employeeId": employee_id,
        "now": timestamp_iso,
        "comment": "Integración HikCentral"
    }

    # Construir headers dinámicamente para evitar valores None en import-time
    headers = {"Content-Type": "application/json"}
    if HUMAND_TOKEN:
        headers["Authorization"] = f"Basic {HUMAND_TOKEN}"
    else:
        logger.warning("[CONFIG] HUMAND_TOKEN not set; request will be unauthenticated")

    try:
        r = requests.post(url, json=body, headers=headers, timeout=10)
        logger.info(f"[HUMAND] {tipo} DNI {employee_id} → {r.status_code}")
        if r.status_code >= 300:
            logger.warning(r.text)
    except Exception as e:
        logger.error(f"[ERROR HUMAND] {e}")

# =========================
# WORKER DE ENVÍO DIFERIDO
# =========================
def worker_envio():
    while True:
        time.sleep(SEND_INTERVAL_SECONDS)

        with lock:
            if not eventos_pendientes:
                continue

            lote = eventos_pendientes.copy()
            eventos_pendientes.clear()

        logger.info(f"[WORKER] Procesando {len(lote)} eventos")

        for ev in lote:
            enviar_a_humand(
                ev["tipo"],
                ev["employee_id"],
                ev["timestamp"]
            )

# =========================
# WEBHOOK
# =========================
@app.route("/webhook/hikvision/events", methods=["POST"])
def recibir_eventos():
    data = request.get_json()

    try:
        events = data.get("params", {}).get("events", [])

        for event in events:
            event_id = event.get("eventId")
            src_name = event.get("srcName")
            card_no = event.get("data", {}).get("cardNo")
            happen_time = event.get("happenTime")

            if not event_id or not card_no or not happen_time:
                logger.warning("[EVENTO INVALIDO] Faltan campos")
                continue

            with lock:
                if event_id in eventos_procesados:
                    logger.info(f"[DUPLICADO] {event_id}")
                    continue
                eventos_procesados.add(event_id)

            if src_name == ENTRADA_DEVICE:
                tipo = "Entrada"
            elif src_name == SALIDA_DEVICE:
                tipo = "Salida"
            else:
                logger.info(f"[IGNORADO] Dispositivo {src_name}")
                continue

            with lock:
                eventos_pendientes.append({
                    "tipo": tipo,
                    "employee_id": card_no,
                    "timestamp": happen_time
                })

            logger.info(
                f"[EN COLA] {tipo} | DNI {card_no} | {src_name} | {happen_time}"
            )

        return jsonify({"code": "0", "msg": "OK"}), 200

    except Exception as e:
        logger.exception("[ERROR WEBHOOK]")
        return jsonify({"code": "1", "msg": str(e)}), 500

# =========================
# HEALTH
# =========================
@app.route("/webhook/health", methods=["GET"])
def health():
    return jsonify({
        "status": "running",
        "dry_run": DRY_RUN,
        "pending_events": len(eventos_pendientes),
        "processed_events": len(eventos_procesados)
    }), 200

# =========================
# MAIN
# =========================
if __name__ == "__main__":
    logger.info("=== HIKVISION → HUMAND WEBHOOK STARTED ===")
    logger.info(f"DRY_RUN = {DRY_RUN}")
    logger.info(f"SEND_INTERVAL = {SEND_INTERVAL_SECONDS}s")

    threading.Thread(target=worker_envio, daemon=True).start()

    app.run(host="0.0.0.0", port=5000, debug=False)

# Hikvision ? Humand Webhook

Integración entre **HikCentral (Hikvision)** y **Humand** para el envío de
eventos de **Ingreso (Entrada)** y **Egreso (Salida)** del personal mediante
dispositivos de reconocimiento facial.

---

## ?? Alcance

? Recibe eventos vía Webhook desde HikCentral  
? Filtra únicamente dos dispositivos:
- `Facial Entrada`
- `Facial Salida`

? Control de duplicados  
? Modo DRY-RUN (pruebas sin impacto)  
? Envío diferido cada X segundos  
? Logging rotativo (máx. ~25 MB)  
? Listo para ejecutarse como **Servicio de Windows**

---

## ?? Requisitos

- Windows Server 2016+
- Python 3.9+
- Acceso saliente a API Humand
- HikCentral con Webhook configurado

---

## ?? Instalación

```bash
pip install -r requirements.txt

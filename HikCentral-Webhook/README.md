# 🚀 Hikvision → Humand Time Tracking Integration

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-Private-lightgrey)

Middleware service that retrieves access control events from **HikCentral Professional (Artemis OpenAPI)** and sends time tracking records to **Humand** (`clock-in / clock-out`).

---

## 📌 Overview

This project integrates:

- 🎥 HikCentral Professional (Artemis OpenAPI)
- 🔐 Access Control / Facial Recognition devices
- 👥 Humand Time Tracking API
- 🧠 Python middleware service

The service polls or subscribes to Hikvision access events and forwards them to Humand as clock-in / clock-out records.

---

## 🏗 Architecture

```
Hikvision Devices (Facial / Card Reader)
            │
            ▼
HikCentral Professional (Artemis API)
            │
            ▼
Python Middleware
            │
            ▼
Humand API
(time-tracking/clock-in / clock-out)
```

---

## 🔐 Authentication

### Hikvision (Artemis OpenAPI)

Uses HMAC SHA256 signature.

Required headers:

```
x-ca-key
x-ca-signature
Accept: */*
Content-Type: application/json
```

Signature string format example:

```
POST
*/*
x-ca-key:{APP_KEY}
/artemis/api/...
```

---

### Humand API

Uses Basic Authentication:

```
Authorization: Basic <BASE64_TOKEN>
```

---

## 📡 Humand Endpoints Used

```
POST /time-tracking/clock-in
POST /time-tracking/clock-out
GET  /public/api/v1/users
```

Example request body:

```json
{
  "employeeId": "43013830",
  "now": "2026-01-27T08:12:45.123-03:00",
  "comment": "Hikvision facial entry"
}
```

---

## 📦 Installation

### Requirements

- Python 3.10+
- pip

Install dependencies:

```bash
pip install -r requirements.txt
```

If needed:

```bash
pip install requests
```

---

## ⚙ Configuration

Create a `.env` file (recommended):

```
HIKVISION_HOST=https://192.168.4.252
HIK_APP_KEY=your_app_key
HIK_SECRET=your_secret

HUMAND_BASE_URL=https://api-prod.humand.co
HUMAND_AUTH=Basic xxxxxxxxx
```

⚠ Never commit real credentials to GitHub. <- Recordatorio

---

## ▶ Running the Project

```bash
python main.py
```

Or via scheduler:

```bash
python scheduler.py
```

Recommended polling interval:

- Every 5–10 minutes

## 🧪 Run tests locally

Install the project requirements and execute pytest:

```bash
pip install -r requirements.txt
pytest -q
```

## 🏁 Run locally (development)

Create a `.env` based on `.env.example`, enable `DRY_RUN=true` for safe testing, then:

```bash
python webhook_server.py
```

---

## 🧠 Mapping Strategy

| Hikvision Field | Humand Field |
|----------------|--------------|
| personId | employeeInternalId |
| eventTime | now |
| Entry device | clock-in |
| Exit device | clock-out |

---

## ⚠ Business Rules (Humand)

- No bulk requests (1 record per request)
- Entries must alternate:

```
clock-in → clock-out → clock-in → clock-out
```

Common errors:

| Code | Description |
|------|------------|
| 200 | Success |
| 422 | Future entry |
| 422 | Duplicate entry |
| 422 | Entry without exit |

---

## 📊 Logging

The middleware logs:

- Events processed
- Requests sent to Humand
- API responses
- Signature errors
- Mapping failures

---

## ⚠ Known Limitations

- Not all facial recognition events are exposed via OpenAPI.
- AI endpoints may require additional licensing.
- Direct SQL Server access is unsupported and not recommended.

---

## 🔒 Security Notes

- Use environment variables.
- Restrict network access to HikCentral.
- Validate HTTPS certificates in production.
- Do not store tokens in repository.

---

## 📈 Future Improvements

- Local cache database
- Retry queue system
- Docker container
- Health-check endpoint
- Monitoring dashboard
- Unit tests

---

## 👨‍💻 Author: Roberto Ezequiel Sanabria 

Integration Middleware  
Access Control → HR Time Tracking System

---

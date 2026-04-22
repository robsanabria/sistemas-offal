import requests
import json
import urllib3
import time
import uuid
import hmac
import hashlib
import base64

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

HIKVISION_HOST = "https://192.168.4.252"
APP_KEY = "28427905"
APP_SECRET = "xGwdwTOrMK3RbnIu8iIm"

YOUR_IP = "127.0.0.1"
YOUR_PORT = 5000


WEBHOOK_URL = "http://127.0.0.1:5000/webhook/hikvision/events"

def sign_request(method, path):
    timestamp = str(int(time.time() * 1000))
    nonce = str(uuid.uuid4())

    accept = "*/*"
    content_type = "application/json"

    string_to_sign = "\n".join([
        method,
        accept,
        content_type,
        path
    ])

    signature = base64.b64encode(
        hmac.new(
            APP_SECRET.encode(),
            string_to_sign.encode(),
            hashlib.sha256
        ).digest()
    ).decode()

    return {
        "X-Ca-Key": APP_KEY,
        "X-Ca-Signature": signature,
        "X-Ca-Timestamp": timestamp,
        "X-Ca-Nonce": nonce,
        "Accept": accept,
        "Content-Type": content_type
    }

def subscribe_to_events():
    path = "/artemis/api/eventService/v1/eventSubscriptionByEventTypes"
    url = HIKVISION_HOST + path

    payload = {
        "eventTypes": [196893, 197151],
        "eventDest": WEBHOOK_URL,
        "passBack": 1
    }

    headers = sign_request("POST", path)

    print("\n" + "=" * 60)
    print("SUBSCRIBING TO HIKVISION EVENTS")
    print("=" * 60)
    print(f"URL: {url}")
    print(f"Webhook Destination: {WEBHOOK_URL}")
    print(f"Event Types: {payload['eventTypes']}")
    print("=" * 60 + "\n")

    response = requests.post(
        url,
        headers=headers,
        json=payload,
        verify=False
    )

    print(f"Status Code: {response.status_code}")
    print(f"Response:\n{json.dumps(response.json(), indent=2)}")

    if response.json().get("code") == "0":
        print("\n? SUBSCRIPTION SUCCESSFUL!")
    else:
        print("\n? SUBSCRIPTION FAILED")

if __name__ == "__main__":
    subscribe_to_events()

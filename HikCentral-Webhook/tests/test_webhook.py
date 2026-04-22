import sys
from pathlib import Path

# Ensure repo root is on sys.path so pytest can import top-level module
root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root))

from webhook_server import app


def test_health_endpoint():
    client = app.test_client()
    resp = client.get("/webhook/health")
    assert resp.status_code == 200
    data = resp.get_json()
    assert isinstance(data, dict)
    assert data.get("status") == "running"

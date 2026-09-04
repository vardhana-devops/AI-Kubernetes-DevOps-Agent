from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200


def test_metrics_endpoint():
    response = client.get("/metrics")

    assert response.status_code == 200
    assert "http_requests_total" in response.text


def test_openapi_endpoint():
    response = client.get("/openapi.json")

    assert response.status_code == 200
    assert response.json()["info"]["title"] == "AI Kubernetes DevOps Agent"

"""
Unit and integration test suite for apps/document-worker.
Tests layout parsing, bounding box extraction, security guards, and HTTP contract conformance.
"""

import base64
import pytest
from fastapi.testclient import TestClient

from app.main import app, INTERNAL_AUTH_SECRET
from app.parser import DocumentParser, SecurityValidationError, BoundingBox


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def auth_headers():
    return {"Authorization": f"Bearer {INTERNAL_AUTH_SECRET}"}


@pytest.fixture
def sample_pdf_bytes():
    return (
        b"%PDF-1.4\n"
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        b"3 0 obj\n<< /Type /Page >>\nendobj\n"
        b"stream\n"
        b"(Debo Research Paper Title) Tj\n"
        b"(Table: Results | Accuracy 99.4%) Tj\n"
        b"(Section 1: Grounded Citations Architecture) Tj\n"
        b"endstream\n"
        b"%%EOF\n"
    )


def test_health_check(client):
    """Liveness probe test."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "document-worker"


def test_unauthenticated_request_rejected(client):
    """Enforces Non-LLM Authority: unauthenticated requests must be rejected."""
    # No header -> 401
    resp1 = client.post("/process-document", json={"workspaceId": "ws_123", "sourceId": "src_123"})
    assert resp1.status_code == 401

    # Invalid secret -> 403
    resp2 = client.post(
        "/process-document",
        headers={"Authorization": "Bearer wrong-secret"},
        json={"workspaceId": "ws_123", "sourceId": "src_123"},
    )
    assert resp2.status_code == 403


def test_process_document_success(client, auth_headers, sample_pdf_bytes):
    """Verifies document parsing returns Markdown and bounding boxes."""
    b64_content = base64.b64encode(sample_pdf_bytes).decode("ascii")
    payload = {
        "workspaceId": "ws_prod_001",
        "sourceId": "src_paper_001",
        "content": b64_content,
        "fileName": "research.pdf",
        "options": {
            "enableOcr": True,
            "extractTables": True,
            "generateBoundingBoxes": True,
        },
    }

    response = client.post("/process-document", headers=auth_headers, json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "COMPLETED"
    assert data["workspaceId"] == "ws_prod_001"
    assert data["sourceId"] == "src_paper_001"
    assert data["pageCount"] >= 1
    assert "markdown" in data
    assert len(data["chunks"]) > 0

    first_chunk = data["chunks"][0]
    assert "chunkIndex" in first_chunk
    assert "pageNumber" in first_chunk
    assert "boundingBox" in first_chunk
    bbox = first_chunk["boundingBox"]
    assert 0.0 <= bbox["x0"] <= 1.0
    assert 0.0 <= bbox["y0"] <= 1.0
    assert bbox["x1"] >= bbox["x0"]
    assert bbox["y1"] >= bbox["y0"]


def test_process_document_table_detection(client, auth_headers, sample_pdf_bytes):
    """Verifies table extraction flag."""
    b64_content = base64.b64encode(sample_pdf_bytes).decode("ascii")
    payload = {
        "workspaceId": "ws_prod_001",
        "sourceId": "src_table_001",
        "content": b64_content,
        "options": {"extractTables": True},
    }

    response = client.post("/process-document", headers=auth_headers, json=payload)
    assert response.status_code == 200
    chunks = response.json()["chunks"]
    table_chunks = [c for c in chunks if c.get("isTable")]
    assert len(table_chunks) >= 1


def test_jobs_parse_contract(client, auth_headers):
    """Tests /jobs/parse against docs/contracts/document-worker.md."""
    job_payload = {
        "jobId": "job_durable_987",
        "workspaceId": "ws_workflows",
        "sourceId": "src_r2_doc",
        "rawFileUrl": "https://r2.debo.life/presigned/download/doc.pdf",
        "storageKey": "workspaces/ws_workflows/sources/src_r2_doc/raw.pdf",
        "options": {
            "enableOcr": True,
            "extractTables": True,
            "generateBoundingBoxes": True,
        },
    }

    response = client.post("/jobs/parse", headers=auth_headers, json=job_payload)
    assert response.status_code == 200
    data = response.json()

    assert data["jobId"] == "job_durable_987"
    assert data["status"] == "COMPLETED"
    assert data["pageCount"] >= 1
    assert data["markdownOutputUrl"].endswith("/extracted.md")
    assert data["structuredChunksOutputUrl"].endswith("/chunks.json")
    assert data["processingDurationMs"] >= 0


def test_decompression_bomb_and_size_guard():
    """Verifies parser rejects oversized files to defend against DoS."""
    parser = DocumentParser()

    # Empty file
    with pytest.raises(SecurityValidationError, match="empty"):
        parser.validate_file_safety(b"")

    # Exceeding size
    oversized = b"%PDF-" + b"0" * (51 * 1024 * 1024)
    with pytest.raises(SecurityValidationError, match="exceeds limit"):
        parser.validate_file_safety(oversized)


def test_invalid_file_format_guard():
    """Verifies binary garbage is rejected."""
    parser = DocumentParser()
    binary_garbage = b"\x00\xff\xfe\x00\x01\x02\x03\x04" * 10
    with pytest.raises(SecurityValidationError, match="Invalid file format"):
        parser.validate_file_safety(binary_garbage)

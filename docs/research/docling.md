# Docling

## Problem solved
State-of-the-art document conversion and parsing library that converts complex PDFs, DOCX, PPTX, and scanned documents into structured, semantically enriched Markdown and JSON, preserving tables, reading order, formula expressions, and layout structure.

## Why considered
Naive text extractors (pypdf, pdfminer) garble multi-column documents, drop tables, and lose heading hierarchies. Debo requires strict document grounding: citations must pinpoint exact tables, sections, and page coordinates. Docling provides industrial-grade layout fidelity.

## Official repository
`https://github.com/DS4SD/docling`

## Official documentation
`https://ds4sd.github.io/docling/`

## Current version/date checked
v2.x+ / Checked October 2026

## License
MIT License.

## Deployment models
Python package running in an isolated containerized service (`apps/document-worker`) or executed via serverless GPU/CPU worker.

## TypeScript support
None natively. Must be wrapped in a micro-service or invoked via CLI/worker job contracts (`docs/contracts/document-worker.md`).

## Python support
First-class native Python (3.10+) library with deep PyTorch / HuggingFace model integration.

## MCP support
Can be exposed as an MCP document processing tool.

## Agent framework support
Provides chunkers and document loaders compatible with LangChain and LlamaIndex.

## Workflow support
Runs as an asynchronous processing job triggered by Trigger.dev after file upload to Cloudflare R2.

## Self-hosting
100% open source; runs entirely locally or on a private VPS/GPU instance without sending data to third-party OCR APIs.

## Docker
Easily packaged in an official Python 3.11 slim Docker container with PyTorch CPU or CUDA.

## Authentication
Inter-service authentication via shared HMAC secret or private Docker network boundary.

## Multi-tenancy
Stateless processing worker; takes input file path/URL and returns structured JSON with page metadata.

## Security
No external network calls required during document processing; air-gapped safe.

## Observability
Logs processing duration per page, OCR confidence, and memory usage.

## Strengths
- Exceptional table extraction (outputs clean Markdown / HTML tables).
- True reading order recovery for multi-column academic and business PDFs.
- Outputs bounding box coordinates for each paragraph, enabling pixel-perfect visual citation highlighting in Debo.
- Permissive MIT license backed by IBM Deep Search research.

## Weaknesses
- Heavy runtime dependencies (PyTorch, vision models); requires 2-4GB RAM during peak PDF rasterization.
- Python only; cannot run directly in the Next.js Node/Bun web process.

## Alternatives considered
Unstructured.io (more complex licensing, heavier container), LlamaParse (proprietary closed cloud, privacy risks), PyPDF2 (poor layout quality).

## Benchmark evidence
Achieves >94% table structure recognition accuracy and outscores standard OCR pipelines on complex financial statements and research papers.

## Cost considerations
Zero license fees. Compute costs: runs comfortably on a $12-$24/mo Hetzner VPS or serverless container instance.

## Exit strategy
Docling outputs standard Markdown and JSON documents adhering to our Document schema; underlying parsing engine can be swapped if needed.

## Recommendation
**Accepted as Mandatory Document Processing Engine**. Must run strictly inside the isolated `apps/document-worker` service.

## Confidence
Very High (4.8 / 5.0)

## Sources
- Official repository: https://github.com/DS4SD/docling
- Documentation: https://ds4sd.github.io/docling/
- PyPI package: `docling`

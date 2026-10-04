# Status
accepted

# Context
Users upload complex documents to Debo: multi-column research papers, quarterly financial reports with nested tables, scanned invoices, legal contracts, and presentation decks. Naive text extraction (e.g. basic pdfplumber or pypdf) strips away table structure, confuses reading orders, and discards page bounding coordinates. Without structural coordinates, Debo cannot produce grounded citations that highlight exact sentences and table cells in the source viewer.

# Decision
We adopt **Docling (IBM Deep Search)** as Debo's primary document conversion and layout parsing engine:
- Isolated exclusively inside `apps/document-worker` running as a containerized Python service.
- Dispatched via Trigger.dev durable workflows (`@debo/workflows`).
- Outputs structured Markdown and JSON with paragraph-level and table-cell bounding box coordinates and page numbers.

# Alternatives
1. **Unstructured.io**: Evaluated (Score 4.17/5.0). Powerful, but heavier container footprint and more complex open-source vs enterprise license tiers.
2. **LlamaParse**: Evaluated (Score 3.77/5.0). High accuracy, but closed-source proprietary cloud API that violates Debo's privacy commitment by sending user documents to a third-party closed SaaS.
3. **PyPDF / pdfminer**: Evaluated. Insufficient layout parsing; completely fails on complex multi-column layouts and tables.

# Why
Docling is open-source (MIT license), runs completely self-hosted without external network dependencies, achieves state-of-the-art accuracy on table structure recognition (>94%), and provides reading-order preservation essential for trustworthy citations.

# Consequences
- **Positive**: Exceptional parsing fidelity; zero document leakage to external third-party OCR vendors; pixel-level coordinate outputs for citation rendering.
- **Negative**: Requires allocating 2-4GB RAM on the document worker instance to run deep learning OCR and layout models during peak conversion.

# Migration / Exit Strategy
The output of `apps/document-worker` is normalized to our standard `Document` schema (`docs/contracts/document-worker.md`). Any future layout parsing engine can replace Docling without changing the downstream memory ingestion pipeline.

# Evidence
- Docling Technical Report & Repository: `https://github.com/DS4SD/docling`
- Scorecard ranking: 4.76 / 5.0 in `docs/research/scorecard.md`.

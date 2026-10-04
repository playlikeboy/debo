# Status
accepted

# Context
AI systems frequently suffer from language fragmentation: teams split business logic, API routers, database entities, and agent definitions across Python and TypeScript, causing schema drift, double maintenance, and complex debugging. We must establish a clear, non-negotiable language boundary.

# Decision
We adopt **TypeScript as the primary language** for all product applications, agent orchestration, database access, MCP servers, and background workflows.
We isolate **Python strictly to specialized machine learning, OCR, and document layout parsing** within `apps/document-worker`.
No third language (e.g. Go, Rust, Java) will be introduced without an explicit ADR demonstrating impossibility in TypeScript or Python.

# Alternatives
1. **Python as Full-Stack Backend**: Rejected. Python web frameworks (FastAPI) lack the tight frontend-backend type sharing provided by Next.js/TypeScript, and React UI integration requires duplicate schema declarations.
2. **TypeScript for Everything (including OCR/PDF)**: Evaluated. Pure JavaScript PDF extractors (pdfjs, pdfminer-ports) fail to reliably extract complex multi-column reading orders and nested financial tables compared to state-of-the-art vision models like Docling.

# Why
TypeScript allows end-to-end type safety from the database schema (Drizzle ORM) through LangGraph agent state, API contracts (Zod), and React UI components. Python is reserved strictly where the deep learning/OCR ecosystem holds an undeniable structural advantage (Docling / PyTorch).

# Consequences
- **Positive**: 90%+ of the codebase is unified in TypeScript; domain types (`@debo/types`) are shared universally; single runtime mental model for web developers.
- **Negative**: Requires maintaining a clean inter-process boundary (HTTP / Trigger.dev task contract) between TypeScript workers and the Python document worker.

# Migration / Exit Strategy
The contract between TypeScript and Python is strictly formalized in `docs/contracts/document-worker.md` via JSON schemas. If Docling ever releases a native high-performance WebAssembly or ONNX TypeScript binding, the Python worker can be deprecated and absorbed into the TypeScript pipeline.

# Evidence
- See `docs/research/docling.md` for document extraction benchmarks.
- LangGraph JS vs Python parity: `@langchain/langgraph` provides full feature parity with Python for graph orchestration.

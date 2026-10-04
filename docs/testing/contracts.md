# Contract Testing Strategy

Contract testing verifies that independent subsystems and services agree on message formats, serialization schemas, and error codes without requiring full end-to-end environments.

---

## 1. Boundary Contract Test Pairs

Debo defines contract tests across six critical system boundaries:

```text
1. Web Client          ◄──[ AG-UI Protocol Contract ]──►   LangGraph Agent
2. LangGraph Agent     ◄──[ MemoryProvider Contract ]──►   Supermemory Adapter
3. LangGraph Agent     ◄──[ ActionConnector Contract ]─►   Composio Gateway
4. LangGraph Agent     ◄──[ Trigger.dev Event Model ]──►   Workflow Runner
5. External Clients    ◄──[ MCP Protocol Contract ]────►   Debo MCP Server
6. TypeScript Worker   ◄──[ JSON Schema Job Contract ]─►   Python Docling Worker
```

---

## 2. Testing Methodology & Verification

1. **Schema-Driven Fuzzing**:
   - For every boundary schema (defined in `docs/contracts/`), automated fuzz tests generate 1,000 valid and invalid payloads.
   - Consumers must cleanly reject invalid payloads with typed 400-level errors without throwing unhandled 500 exceptions.
2. **Mock Provider Harnesses**:
   - `MockMemoryProvider`, `MockActionConnector`, and `MockDoclingWorker` test fixtures allow running the full LangGraph reasoning graph locally in under 2 seconds without external cloud calls.
3. **Automated CI Validation**:
   - If a PR alters a Zod schema in `packages/types` that affects a contract in `docs/contracts/`, contract tests run against serialized snapshots of prior version payloads to ensure backward compatibility.

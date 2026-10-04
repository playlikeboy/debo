# Debo Testing Strategy & Quality Gates

To ensure unwavering reliability across personal context retrieval, multi-tenant security, and distributed agent execution, Debo enforces an exhaustive multi-layer testing strategy.

---

## 1. Testing Pyramid & Gates

```text
               ▲
              / \
             /E2E\             ── Playwright User Journeys
            /-----\
           /Contr. \           ── Zod & Pact Inter-Service Contract Tests
          /---------\
         /Integrat.  \         ── Testcontainers (Neon PG, Supermemory, R2)
        /-------------\
       /  Unit Tests   \       ── Fast isolated pure function tests (Bun test)
      /-----------------\
```

---

## 2. Testing Layers & Deployment Blocking Gates

| Test Suite | Execution Scope | Blocking for PR? | Blocking for Production Deploy? | Tooling |
|---|---|---|---|---|
| **Unit Tests** | Pure business functions, chunking algorithms, Zod schema parsers. | **Yes** | **Yes** | `bun test` |
| **Typecheck & Lints**| Full TypeScript compilation with zero `any` evasions. | **Yes** | **Yes** | `tsc --noEmit` & Biome |
| **Contract Tests** | Boundary tests across API, MCP, and TS-to-Python interfaces. | **Yes** | **Yes** | Zod / JSON Schema validation |
| **Multi-Tenant Security**| 10,000 synthetic cross-tenant query probes (Zero leak tolerance). | **Yes** | **Yes** | Custom security test runner |
| **Memory Grounding Eval**| Citation accuracy ($\ge 98\%$) and latest-state recall ($\ge 98\%$). | **Yes** | **Yes** | `docs/evals/memory/` runner |
| **End-to-End (E2E)** | Full upload-to-citation user journeys in headless browser. | No (Nightly) | **Yes** | Playwright |
| **Load & Stress Tests**| Concurrent PDF parsing and vector query throughput. | No (Weekly) | Pre-Release Audit | k6 |

---

## 3. What Strictly Blocks Deployment

Any pull request or release tag is immediately halted if:
1. Any unit, integration, or contract test fails.
2. Any TypeScript typecheck error occurs.
3. Cross-tenant leakage is detected in any test query.
4. An ungrounded citation is produced during memory evaluation benchmarks.
5. Undocumented architecture changes or missing ADRs are flagged in docs check CI.

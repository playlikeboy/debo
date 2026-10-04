# Change Management & Architectural Discipline

Debo enforces a strict engineering workflow to ensure the codebase remains maintainable, reliable, and completely understood by both human developers and autonomous AI agents.

---

## 1. The Canonical Change Protocol

Every non-trivial modification to Debo must follow this linear progression:

```text
1. PROPOSAL          ── Identify problem / requirement in BACKLOG.md
        │
        ▼
2. RESEARCH          ── Investigate official docs, benchmarks, licenses
        │
        ▼
3. ADR / SPEC        ── Author or update numbered ADR in docs/adr/ and docs/specs/
        │
        ▼
4. IMPLEMENTATION    ── Author clean TypeScript / Python code
        │
        ▼
5. TEST SUITE        ── Add unit, integration, and contract tests
        │
        ▼
6. VERIFICATION      ── Run full test suite & confirm zero regressions
        │
        ▼
7. DOCS UPDATE       ── Update PROJECT_STATUS.md & CHANGELOG-OF-DECISIONS.md
```

---

## 2. The Incomplete Work Rule

> **Code-only pull requests that change architecture, database schemas, or API contracts without updating documentation are strictly classified as INCOMPLETE WORK and will be rejected.**

AI coding agents must never consider a task finished until:
- The implementation is tested.
- All related markdown specifications in `docs/` reflect the new truth.
- `PROJECT_STATUS.md` is updated with the real Git commit hash.

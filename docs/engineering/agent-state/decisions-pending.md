# Decisions Pending

This document records architectural or security forks requiring empirical benchmarks or orchestrator review before lock-in.

| Decision ID | Area | Options | Trade-offs | Recommendation | Status |
|---|---|---|---|---|---|
| `DEC-0001` | Linter / Formatter | Biome vs ESLint+Prettier | Biome is 25x faster; ESLint has broader plugin ecosystem | Start with Biome for ultra-fast CI/local checks; retain ESLint compatibility | Accepted (Biome) |
| `DEC-0002` | Test Runner | Bun Test vs Vitest | Bun test is built-in with zero overhead; Vitest supports in-browser testing | Use `bun:test` for backend/platform packages; Vitest/Playwright for UI | Accepted (Hybrid) |

# Integration State

This document tracks the current state of continuous integration, cross-package compatibility, and build matrix health.

## Package Matrix

| Package / App | Version | Status | Typecheck | Tests | Build |
|---|---|---|---|---|---|
| `packages/config` | `0.1.0` | Queued | - | - | - |
| `packages/types` | `0.1.0` | Queued | - | - | - |
| `packages/db` | `0.1.0` | Queued | - | - | - |
| `packages/auth` | `0.1.0` | Queued | - | - | - |
| `packages/permissions` | `0.1.0` | Queued | - | - | - |
| `packages/citations` | `0.1.0` | Queued | - | - | - |
| `packages/memory` | `0.1.0` | Queued | - | - | - |
| `packages/storage` | `0.1.0` | Queued | - | - | - |
| `packages/workflows` | `0.1.0` | Queued | - | - | - |
| `packages/connectors` | `0.1.0` | Queued | - | - | - |
| `packages/mcp` | `0.1.0` | Queued | - | - | - |
| `packages/agent` | `0.1.0` | Queued | - | - | - |
| `packages/ui` | `0.1.0` | Queued | - | - | - |
| `apps/web` | `0.1.0` | Queued | - | - | - |
| `apps/mcp` | `0.1.0` | Queued | - | - | - |
| `apps/worker` | `0.1.0` | Queued | - | - | - |
| `apps/document-worker` | `0.1.0` | Queued | - | - | - |
| `apps/docs` | `0.1.0` | Queued | - | - | - |

## Integration Invariants
1. Primitives depend on zero upward libraries (`@debo/types` has 0 dependencies).
2. Domain services depend on repositories and abstractions, never on web framework routers.
3. Every package compiles via Turborepo without circular references.

# Status
accepted

# Context
Debo is composed of user-facing web applications, an MCP server, background worker jobs, document processing microservices, portable skills, and shared internal domain libraries (data models, memory provider interfaces, storage utilities, and type contracts). We need a repository layout and build orchestration system that maximizes developer velocity, maintains strict package boundaries, eliminates dependency version drift, and provides fast, cached builds without microservice sprawl.

# Decision
We adopt a **modular monorepo managed with Bun Workspaces and Turborepo**:
- **Apps**: `apps/web`, `apps/mcp`, `apps/worker`, `apps/document-worker`, `apps/docs`.
- **Packages**: `@debo/agent`, `@debo/ai`, `@debo/memory`, `@debo/connectors`, `@debo/workflows`, `@debo/mcp`, `@debo/permissions`, `@debo/citations`, `@debo/db`, `@debo/storage`, `@debo/auth`, `@debo/types`, `@debo/ui`, `@debo/config`.
- **Package Manager & Runtime**: Bun is the primary package manager and local runtime for TypeScript packages; Turborepo orchestrates the build dependency graph and remote caching.

# Alternatives
1. **Multi-repo structure**: Rejected due to high overhead for synchronizing type contracts, multi-PR coordination, and version management across early-stage development.
2. **pnpm + Turborepo**: High-quality alternative, but Bun provides unified bundling, instant script execution, and significantly faster package installations.
3. **Nx**: More opinionated and complex configuration overhead than required for a minimal-service monorepo.

# Why
Bun Workspaces combined with Turborepo delivers sub-second package linking, deterministic lockfile reproducibility, and fast topological build pipeline execution (`build`, `test`, `typecheck`, `lint`) across apps and packages.

# Consequences
- **Positive**: Single source of truth for all domain types (`@debo/types`), zero publish step needed for internal shared code, unified CI checks, atomic cross-package refactoring.
- **Negative**: Monorepo tooling requires careful `.gitignore` and workspace path configuration; polyglot inclusion of Python (`apps/document-worker`) requires explicit lifecycle task isolation in `turbo.json`.

# Migration / Exit Strategy
Packages adhere to standard TypeScript Project References and `package.json` exports. If a package needs to become a standalone public library in the future, it can be published to npm or extracted to an independent repository without code changes.

# Evidence
- Turborepo Benchmarks (Vercel): 85% build time reduction via local/remote computation caching.
- Bun Monorepo Documentation: `https://bun.sh/docs/install/workspaces`

# Architectural Taxonomy: Specs vs ADRs vs Plans vs Tickets vs Status Ledgers

To ensure complete clarity for human engineers and autonomous AI agents, Debo enforces strict definitions and boundaries between documentation artifacts. Never mix the contents of these documents.

---

## 1. The Core Artifact Taxonomy

```text
       ┌──────────────┐
       │   ADR (Why)  │ ── "Why did we choose Neon + Drizzle over Prisma?"
       └──────┬───────┘
              │ informs
              ▼
       ┌──────────────┐
       │  Spec (What) │ ── "What are the exact table schemas, fields, and constraints?"
       └──────┬───────┘
              │ dictates
              ▼
       ┌──────────────┐
       │  Plan (How)  │ ── "In which phase and sequence do we construct the DB?"
       └──────┬───────┘
              │ breaks into
              ▼
       ┌──────────────┐
       │ Ticket (Work)│ ── "DEBO-0021: Define Drizzle schema for Source and Memory"
       └──────┬───────┘
              │ updates
              ▼
       ┌──────────────┐
       │ Status (Done)│ ── "Phase 1: DB Schema implemented in commit abc1234"
       └──────────────┘
```

---

## 2. Definitions and Strict Responsibilities

### 1. Architecture Decision Record (ADR) — *The "Why"*
- **Location**: `docs/adr/ADR-XXXX-<title>.md`
- **Purpose**: Captures the historical context, alternatives evaluated, trade-offs, and justification for a foundational decision.
- **Characteristics**: Immutable once `accepted` (unless formally superseded by a newer ADR). Explains *why* we chose technology X over Y and Z.
- **Rule**: Do not write low-level implementation details or step-by-step task lists inside an ADR.

### 2. Normative Specification (Spec) — *The "What"*
- **Location**: `docs/specs/<domain>-spec.md`
- **Purpose**: Defines what the system must do, using RFC 2119 keywords (`MUST`, `MUST NOT`, `SHOULD`, `MAY`).
- **Characteristics**: Living document that reflects the current, active target contracts, invariants, schemas, and security boundaries.
- **Rule**: A spec states requirements, not historical rationale or temporary implementation hacks.

### 3. Implementation Plan / Roadmap — *The "How & When"*
- **Location**: `docs/planning/ROADMAP.md` and `docs/planning/PHASES.md`
- **Purpose**: Defines the sequential rollout strategy, dependencies, phase exit criteria, and risk mitigations.
- **Characteristics**: Organized into chronological phases (Phase 0 through Phase 16).
- **Rule**: A plan does not dictate architecture; it organizes execution according to accepted ADRs and Specs.

### 4. Implementation Ticket — *The "Unit of Work"*
- **Location**: `docs/planning/BACKLOG.md`
- **Purpose**: A self-contained, testable, and reviewable engineering deliverable (`DEBO-XXXX`).
- **Characteristics**: Contains goal, context, dependencies, acceptance criteria, security checks, test plan, and commit SHA tracking.
- **Rule**: A ticket must be bounded. It should be executable in a single focused PR or agent turn.

### 5. Project Status Ledger — *The "What Is Verified"*
- **Location**: `PROJECT_STATUS.md` and `docs/planning/CHANGELOG-OF-DECISIONS.md`
- **Purpose**: The empirical record of truth regarding what has actually been implemented, tested, and verified on the default branch.
- **Characteristics**: Contains real Git commit hashes, verification dates, active blockers, and milestone metrics.
- **Rule**: NEVER fabricate a commit SHA. If an item is not verified, its status is `TBD` or `[ ]`.

# Definition of Done (DoD) & Verification Standards

To guarantee engineering excellence and eliminate technical debt, no ticket or task in Debo may be marked as complete until it satisfies the rigorous criteria defined in this document.

---

## 1. Ticket Lifecycle Statuses

Every task in `docs/planning/BACKLOG.md` tracks its progress using standard status badges:

- **`[ ]` Not Started**: Scheduled work; requirements documented.
- **`[-]` In Progress**: Active development underway in an assigned branch.
- **`[x]` Implemented**: Code merged to default branch; awaiting verification.
- **`[v]` Verified**: Formally verified by passing automated test suites in CI with real commit SHAs.
- **`[!]` Blocked**: Impeded by an external blocker or unresolved dependency.
- **`[~]` Superseded**: Replaced by an updated ticket or modified ADR.

---

## 2. Commit SHA Tracking Invariant

> **NEVER invent or fabricate a Git commit SHA.**
> If an implementation or verification commit has not yet occurred, the field MUST remain `TBD`. Fictitious commit hashes invalidate auditability and are strictly prohibited.

---

## 3. Mandatory Definition of Done Checklist

A ticket is officially completed (`[v]`) ONLY when all following conditions are verified:

### 1. Architectural Integrity
- [ ] Complies with all non-negotiable rules in `AGENTS.md`.
- [ ] Aligns with accepted ADRs in `docs/adr/`.
- [ ] Introduces zero unvetted dependencies (`docs/engineering/dependencies.md`).
- [ ] Preserves non-LLM permission authority.

### 2. Code Quality & Type Safety
- [ ] Strict TypeScript compilation passes with zero errors (`tsc --noEmit`).
- [ ] Zero `any` evasions or bypassed linter rules.
- [ ] Clean Biome lint and format check.

### 3. Multi-Tenant Security
- [ ] All database queries, vector lookups, and storage accesses unconditionally enforce `workspace_id`.
- [ ] No plaintext secrets or tokens stored in application tables.

### 4. Automated Testing
- [ ] Unit tests cover pure logic, edge cases, and failure modes.
- [ ] Contract tests validate boundary schemas against `docs/contracts/`.
- [ ] All tests pass cleanly in local runtimes and CI.

### 5. Documentation Synchronization
- [ ] All related specifications in `docs/specs/` reflect the new truth.
- [ ] `PROJECT_STATUS.md` and `docs/planning/CHANGELOG-OF-DECISIONS.md` updated with real commit SHAs.

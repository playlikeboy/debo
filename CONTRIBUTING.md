# Contributing to Debo

Thank you for contributing to Debo! We are building a private, source-backed personal AI memory and context operating system.

---

## 1. Clean-Room Architecture & Current Status

Debo has undergone a complete clean-room restart and is currently in **Phase 0 (Clean-Room Documentation & Architecture Bootstrap)**:
- We are establishing normative specifications, ADRs, research evaluations, and contract schemas.
- **Do not submit PRs implementing legacy frameworks** (Mastra, ungrounded vector search, or fragmented microservices).
- All proposals and contributions must adhere to [AGENTS.md](file:///home/kunalkashyap8024/sop/debo/AGENTS.md) and accepted ADRs in [`docs/adr/`](file:///home/kunalkashyap8024/sop/debo/docs/adr/README.md).

---

## 2. Design Philosophy: Calm Editorial Precision

Debo prioritizes clarity, cognitive tranquility, and source transparency over flashy AI gimmicks:
- **Typography-first**: High-contrast, beautifully kerned editorial typography.
- **Warm Canvas**: Restful surfaces avoiding stark digital neon.
- **Zero Hallucination Tolerance**: Every assertion rendered in the UI must display clickable provenance linking directly to the underlying raw source in Cloudflare R2.
- **Deterministic Control**: The LLM suggests; deterministic application code and explicit human approvals authorize.

---

## 3. Contribution Workflow

1. **Check the Backlog**: Consult [`docs/planning/BACKLOG.md`](file:///home/kunalkashyap8024/sop/debo/docs/planning/BACKLOG.md) for active tickets (DEBO-XXXX).
2. **Review Specifications**: Ensure your proposed work aligns with normative specs in [`docs/specs/`](file:///home/kunalkashyap8024/sop/debo/docs/specs/).
3. **Propose Architecture Changes First**: If you need to introduce an external dependency or alter system boundaries, submit an ADR in `docs/adr/` before writing code.
4. **Follow Semantic Commit Conventions**: Use conventional commits (`docs:`, `spec:`, `feat:`, `fix:`, `refactor:`, `test:`).
5. **Update Documentation**: Any change to interfaces or models must update corresponding documentation in `docs/` in the same PR.

---

## 4. Code Standards & Boundaries

- **TypeScript Primary**: Strict TypeScript is enforced across all apps, packages, and tools.
- **Python Isolation**: Python is strictly restricted to `apps/document-worker` for Docling OCR and PDF layout parsing.
- **Tenant Scoping**: All database queries and memory lookups must unconditionally filter on `workspace_id`.
- **Secret Protection**: Never commit secrets or `.env` files. Follow [`docs/security/secrets.md`](file:///home/kunalkashyap8024/sop/debo/docs/security/secrets.md).

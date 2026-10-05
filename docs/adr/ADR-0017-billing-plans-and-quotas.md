# ADR-0017: Multi-Tenant Billing Plans, Resource Quotas & Feature Gating

## Status
Accepted

## Context
Debo supports three tiers of workspace tenancy: `free`, `pro`, and `enterprise`. Prior to Phase 16 hardening, plan concepts were mentioned informally across task backlogs without normative quota definitions or programmatic enforcement. To guarantee deterministic tenant boundaries, prevent resource starvation, and align with production security invariants, formal plan specifications and automated gating are required.

## Decision
1. **Canonical Plan Definition**: Each workspace record in PostgreSQL (`workspaces.plan`) has an immutable plan tier: `'free' | 'pro' | 'enterprise'`.
2. **Quota Invariants**:
   - **Free**:
     - Maximum Workspaces: 3
     - Maximum Members per Workspace: 3
     - Maximum Active API Keys: 5
     - API Key Rate Limit: 100 requests per minute
     - Audit Retention: 30 days
     - Advanced Connectors (Composio, Stagehand): Disabled
     - Dedicated Ingestion Workers: Disabled
   - **Pro**:
     - Maximum Workspaces: 15
     - Maximum Members per Workspace: 25
     - Maximum Active API Keys: 25
     - API Key Rate Limit: 600 requests per minute
     - Audit Retention: 365 days
     - Advanced Connectors (Composio, Stagehand): Enabled
     - Dedicated Ingestion Workers: Enabled
   - **Enterprise**:
     - Maximum Workspaces: Unlimited
     - Maximum Members per Workspace: Unlimited
     - Maximum Active API Keys: Unlimited
     - API Key Rate Limit: 3,000 requests per minute
     - Audit Retention: Unlimited (Permanent)
     - Advanced Connectors: Enabled
     - Dedicated Ingestion Workers: Enabled
     - Custom Data Residency & SSO: Enabled
3. **Deterministic Enforcement**:
   - Quotas are enforced in application code (`packages/auth/src/plans.ts`) before database mutations or token minting.
   - Violations raise standard `RateLimitError` or `ForbiddenError` (HTTP 429 / 403) with normative error payloads.
   - LLMs are never permitted to make plan or quota decisions.

## Consequences
- **Positive**: Strict, verifiable guardrails against abuse; transparent feature gating for workspace owners; clear commercial upgrade tiers.
- **Negative**: Requires checking plan limits upon workspace creation, member invitations, and API key generation.

## Evidence
- Implementation: `packages/auth/src/plans.ts` (`PLAN_QUOTAS`, `assertPlanLimit`, `assertPlanFeature`).
- Automated tests: `packages/auth/tests/auth.test.ts` ("Plan Quotas & Feature Gating").

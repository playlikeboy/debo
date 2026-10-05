# Debo Plan Quotas & Feature Gating Specification

## 1. Scope
This document specifies the normative quotas, rate limits, feature availability, and enforcement mechanics for Debo workspace billing plans (`free`, `pro`, `enterprise`).

## 2. Plan Definitions & Quotas

| Metric / Feature | Free Tier | Pro Tier | Enterprise Tier |
| :--- | :--- | :--- | :--- |
| **Max Workspaces Owned** | 3 | 15 | Unlimited (`Infinity`) |
| **Max Members per Workspace** | 3 | 25 | Unlimited (`Infinity`) |
| **Max Active API Keys** | 5 | 25 | Unlimited (`Infinity`) |
| **API Key Rate Limit (RPM)** | 100 req/min | 600 req/min | 3,000 req/min |
| **Audit & Event Retention** | 30 days | 365 days | Unlimited |
| **Composio Action Connectors** | No | Yes | Yes |
| **Nango Durable Sync** | No | Yes | Yes |
| **Stagehand Browser Automation**| No | Yes | Yes |
| **Dedicated Docling Workers** | Shared | Priority | Dedicated Cluster |
| **Custom Domain & SSO** | No | No | Yes |

## 3. Programmatic Enforcement Rules

1. **Workspace Creation Gate**:
   - Caller: `DeboWorkspaceService.createWorkspace(userId, name, plan)`
   - Checks: `count(workspaces WHERE ownerId = :userId) < PLAN_QUOTAS[plan].maxWorkspaces`
   - Failure: HTTP 403 `ForbiddenError("Plan limit exceeded: maximum 3 workspaces allowed on 'free' plan")`

2. **Member Invitation Gate**:
   - Caller: `DeboWorkspaceService.inviteWorkspaceMember(ctx, targetUserId, role)`
   - Checks: `count(workspaceMembers WHERE workspaceId = :workspaceId) < PLAN_QUOTAS[plan].maxMembersPerWorkspace`
   - Failure: HTTP 403 `ForbiddenError("Plan limit exceeded: maximum 3 members allowed on 'free' plan")`

3. **API Key Generation Gate**:
   - Caller: `DeboApiKeyService.createApiKey(ctx, input)`
   - Checks: `count(apiKeys WHERE workspaceId = :workspaceId AND enabled = true) < PLAN_QUOTAS[plan].maxActiveApiKeys`
   - Failure: HTTP 403 `ForbiddenError("Plan limit exceeded: maximum 5 active API keys allowed on 'free' plan")`

4. **API Key Request Rate Limiter**:
   - Enforced by: `DeboApiKeyService.verifyApiKey(rawKey)` and Better Auth API key plugin
   - Sliding window of 60 seconds.
   - Failure: HTTP 429 `RateLimitError("API key rate limit exceeded (100 requests per minute)")`

## 4. Source of Truth
The code implementation lives in `@debo/auth/plans` and is verified by `packages/auth/tests/auth.test.ts`.

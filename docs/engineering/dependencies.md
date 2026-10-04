# Dependency Management & Registry

This document records the curated dependencies approved for the Debo platform. No dependency may be added to `package.json` without documentation here.

---

## 1. Approved Core Dependencies

| Package Name | Approved Version | License | Official Repository | Purpose in Debo | Risk Assessment |
|---|---|---|---|---|---|
| `@langchain/langgraph` | `^0.2.0` | MIT | `github.com/langchain-ai/langgraphjs` | Cyclic agent state machines & checkpointing. | Low. Official LangChain team; active maintenance. |
| `@modelcontextprotocol/sdk` | `^1.0.0` | MIT | `github.com/modelcontextprotocol/typescript-sdk` | Official Model Context Protocol server. | Low. Official Anthropic reference SDK. |
| `@trigger.dev/sdk` | `^3.0.0` | Apache 2.0 | `github.com/triggerdotdev/trigger.dev` | Durable background workflow tasks. | Low. Code-first execution; active development. |
| `drizzle-orm` | `^0.38.0` | Apache 2.0 | `github.com/drizzle-team/drizzle-orm` | TypeScript ORM for Neon PostgreSQL. | Low. Zero-binary runtime; excellent type safety. |
| `zod` | `^3.24.0` | MIT | `github.com/colinhacks/zod` | Runtime schema validation across all boundaries. | Very Low. Industry standard for TypeScript validation. |
| `@supermemory/client` | `^0.3.0` | MIT | `github.com/supermemoryai/supermemory` | Client SDK for Supermemory engine. | Low-Medium. Wrapped in `MemoryProvider` for safety. |
| `@composio/core` | `^0.6.0` | Apache 2.0 | `github.com/composiohq/composio` | External SaaS tool execution gateway. | Low-Medium. Wrapped in `@debo/connectors`. |
| `@aws-sdk/client-s3` | `^3.700.0` | Apache 2.0 | `github.com/aws/aws-sdk-js-v3` | S3 API client for Cloudflare R2 object storage. | Very Low. Official AWS SDK. |
| `docling` (Python) | `^2.0.0` | MIT | `github.com/DS4SD/docling` | PDF layout parsing and OCR extraction. | Low. Deep Search team; isolated to Python worker. |

---

## 2. Dependency Inclusion Checklist

Before adding a new dependency, verify:
- [ ] License is permissive (MIT, Apache 2.0, BSD).
- [ ] Active maintenance (commits within last 90 days; no unaddressed critical CVEs).
- [ ] Native TypeScript types included.
- [ ] Evaluated against existing approved packages to prevent duplicate functionality.

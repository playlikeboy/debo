---
name: debo-workflows
version: 1.0.0
description: Procedural knowledge for authoring, triggering, and inspecting durable Trigger.dev background tasks in Debo.
author: Debo Contributors
license: MIT
tools_required:
  - debo_run_workflow
  - debo_get_workflow
---

# Debo Workflows Skill

Use this skill when designing or invoking asynchronous, long-running background tasks.

## Principles
1. **Durable Steps**: Ensure long-running jobs are decomposed into retryable steps.
2. **Idempotency**: All task runs must accept an `idempotencyKey` to prevent duplicate processing on retries.
3. **Payload Hygiene**: Avoid passing large binary blobs directly in workflow event payloads; pass Cloudflare R2 object keys instead.

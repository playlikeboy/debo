# Stagehand

## Problem solved
AI-native browser automation framework built on Playwright that provides high-level agentic browser actions (`act`, `extract`, `observe`) with self-healing selectors and deterministic execution.

## Why considered
When a target service lacks an API or a pre-built connector is unavailable, Debo needs an intelligent fallback browser agent to retrieve data or automate tasks on the user's behalf.

## Official repository
`https://github.com/browserbase/stagehand`

## Official documentation
`https://docs.stagehand.dev`

## Current version/date checked
v1.x+ / Checked October 2026

## License
Apache 2.0.

## Deployment models
Node.js / TypeScript environment with local Chromium/Playwright or remote cloud browser environments (Browserbase).

## TypeScript support
Native TypeScript SDK with Zod schema validation for data extraction.

## Python support
TypeScript is the primary native implementation; community Python wrappers exist.

## MCP support
Can be exposed as an MCP tool for external agents requiring web browsing.

## Agent framework support
Easily wrapped as tools inside LangGraph agent nodes.

## Workflow support
Runnable as an asynchronous task inside Trigger.dev.

## Self-hosting
Completely open source; can drive local headless Chrome inside a Docker container on a VPS.

## Docker
Runnable inside standard Playwright Docker containers (`mcr.microsoft.com/playwright`).

## Authentication
Supports session cookie re-use, encrypted credential injection, and headless login flows.

## Multi-tenancy
Browser contexts and cookie jars must be strictly isolated per user session.

## Security
High threat vector: untrusted web pages can attempt indirect prompt injection or SSRF. Must run inside sandboxed network profiles with egress filtering.

## Observability
Generates DOM snapshots, action logs, and video recordings of browser runs.

## Strengths
- Modular primitives (`act`, `extract`, `observe`) eliminate brittle CSS/XPath maintenance.
- Strong type safety with Zod schema-guided extraction.
- Permissive Apache 2.0 license.

## Weaknesses
- High resource consumption (headless Chrome requires ~1GB RAM per active instance).
- Risk of CAPTCHAs, IP bans, and anti-bot defenses on target websites.

## Alternatives considered
Raw Playwright/Puppeteer (brittle selectors), Browserless, Crawl4AI.

## Benchmark evidence
Demonstrates >90% extraction reliability on dynamic single-page applications where standard scrapers fail.

## Cost considerations
Self-hosted on VPS: memory-bound. Cloud alternatives (Browserbase) charge ~$0.05 per browser minute.

## Exit strategy
Because Stagehand builds on standard Playwright, workflows can be downgraded to vanilla Playwright scripts if desired.

## Recommendation
**Accepted as Fallback Browser Automation Engine** (Phase 13). Browser automation is strictly a fallback when API/Composio connectors are unavailable.

## Confidence
High (4.4 / 5.0)

## Sources
- Official repository: https://github.com/browserbase/stagehand
- Documentation: https://docs.stagehand.dev
- npm package: `@browserbasehq/stagehand`

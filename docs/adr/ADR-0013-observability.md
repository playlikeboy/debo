# Status
accepted

# Context
Debugging AI agent workflows, vector retrieval pipelines, and distributed background jobs is notoriously difficult without unified tracing. When an agent synthesizes an inaccurate response or fails an action, engineers must be able to inspect the exact prompt, the retrieved memory chunks, the LLM reasoning steps, the tool invocation arguments, and the database queries in a single correlated trace.

# Decision
We adopt a unified observability stack combining **OpenTelemetry, LangSmith, and Sentry**:
1. **Canonical Correlation IDs**: Every operation generates and propagates standard context headers:
   - `traceId`, `requestId`, `workspaceId`, `agentRunId`, `toolCallId`, `memoryQueryId`, `workflowRunId`.
2. **Agent Reasoning Tracing (LangSmith)**:
   - All LangGraph runs, node transitions, token usages, and model prompts are traced natively in LangSmith.
3. **Application Performance & Distributed Tracing (OpenTelemetry)**:
   - OpenTelemetry instruments HTTP requests, database transactions (Drizzle), and external API calls.
4. **Error & Exception Tracking (Sentry)**:
   - Captures client and server runtime exceptions with sourcemap resolution.

# Alternatives
1. **Ad-hoc Console Logs**: Fails completely in distributed agent environments with parallel tool executions and asynchronous workflows.
2. **Datadog / New Relic Alone**: High cost and lacks deep native visualization of LLM prompt templates, token generation steps, and agent graphs compared to LangSmith.

# Why
LangSmith is purpose-built for LangGraph, providing instant, interactive visualization of agent graphs, intermediate node states, and prompt iterations. OpenTelemetry ensures vendor-neutral distributed tracing across our web, worker, and database boundaries.

# Consequences
- **Positive**: Complete transparency into agent reasoning and failure modes; instant tracking of token costs per workspace and user; fast debugging of retrieval regressions.
- **Negative**: Requires configuring tracing headers across asynchronous task dispatches (Trigger.dev).

# Migration / Exit Strategy
Because OpenTelemetry is an open vendor-neutral standard, trace data can be redirected to Grafana Tempo, Honeycomb, or Datadog by simply swapping the OTLP exporter endpoint.

# Evidence
- OpenTelemetry Specification: `https://opentelemetry.io`
- LangSmith Documentation: `https://docs.smith.langchain.com`

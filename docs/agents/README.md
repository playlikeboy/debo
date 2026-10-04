# Debo Agent Intelligence Architecture

This directory defines the agent orchestration system, state machines, tool routing, human-in-the-loop approval workflows, and permission policies governing autonomous reasoning in Debo.

---

## 1. Orchestration Philosophy

Debo's core intelligence is powered by **LangGraph JS** (`@debo/agent`), compiled into cyclic, stateful computational graphs:

```text
                     User Query / Event
                             │
                             ▼
                   ┌──────────────────┐
                   │ Classify Intent  │
                   └─────────┬────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   [ Memory Retrieval ]             [ Connector Action ]
   - Hybrid vector search           - Composio action lookup
   - Temporal anchor query          - Parameter extraction
            │                                 │
            ▼                                 ▼
   [ Context Synthesis ]            [ Human Approval Gate ]
   - Profile injection              - Pause graph execution
   - Citation coordinate link       - Await user signature
            │                                 │
            ▼                                 ▼
   [ Generate Answer ]              [ Execute Action ]
            │                                 │
            ▼                                 ▼
   [ Validate Citations ] ──────────► [ State Checkpoint ]
```

---

## 2. Agent Subsystem Documents

- **[Graph Orchestration & State](file:///home/kunalkashyap8024/sop/debo/docs/agents/orchestration.md)**:
  Channels, node reducers, checkpointing, time-travel resumption, timeouts, and error handling.
- **[Agent Permissions & Approval Gates](file:///home/kunalkashyap8024/sop/debo/docs/agents/permissions.md)**:
  Deterministic tool gating, read vs write scopes, non-LLM authority enforcement.
- **[Agent Memory Access Policy](file:///home/kunalkashyap8024/sop/debo/docs/agents/memory-policy.md)**:
  Fine-grained access boundaries (`agent.read.memory`, `agent.write.tasks`, `agent.execute.destructive`).
- **[Dynamic Model Routing](file:///home/kunalkashyap8024/sop/debo/docs/agents/model-routing.md)**:
  Task-to-model cost and latency optimization matrix.

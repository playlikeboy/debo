# Normative Specification: Agent Orchestration

This document is a normative specification using RFC 2119 language.

---

## 1. Agent Graph Invariants

1. **Deterministic Orchestration**: All agent reasoning flows MUST be modeled as compiled state graphs in LangGraph JS. Arbitrary, unconstrained LLM while-loops are strictly PROHIBITED.
2. **State Checkpointing**: Every node transition in an agent graph MUST be persisted to a transactional checkpointer in Neon PostgreSQL.
3. **Interrupt Semantics**: Any tool classified as Risk Tier 2 (External Mutations) or Risk Tier 3 (Destructive Operations) MUST trigger a graph `interrupt()`. The graph MUST NOT proceed until an authorized human user signs an `Approval` record.
4. **Recursion Limit**: Agent graphs MUST enforce a maximum step limit (default: 25 steps) to prevent runaway execution and token exhaustion.

---

## 2. Citation Validation Gate

- Before returning an answer to the user or caller, the agent graph MUST pass the generated text through a deterministic `validate_citations` node.
- The validation node MUST extract all inline citation tags (`[^chunkId]`).
- If a citation tag references a chunk ID that was not present in the graph's `retrievedChunks` channel, the node MUST strip the invalid reference.
- If more than 50% of asserted factual claims lack valid citations, the node MUST append an uncertainty disclaimer.

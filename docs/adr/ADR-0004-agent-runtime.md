# Status
accepted

# Context
Debo requires an agent orchestration runtime to power complex workflows: intent classification, multi-hop memory retrieval, source citation validation, connector action execution, and post-call summarization. The runtime must support cyclic graph topologies, state checkpointing, and human-in-the-loop approvals.

# Decision
We adopt **LangGraph JS (`@langchain/langgraph`)** as Debo's sole agent orchestration runtime.
All agent graphs will reside in `@debo/agent` (and `src/server/langgraph/`), compiled into stateful graphs with explicit state schemas validated via Zod.
We strictly deprecate and forbid the re-introduction of Mastra.

# Alternatives
1. **Mastra**: Evaluated and discarded. Suffered from high architectural instability, breaking changes across minor versions, and weak checkpointing compared to LangGraph.
2. **Vercel AI SDK Core**: Evaluated. Excellent for simple streaming and linear tool calling, but lacks cyclic graph routing, state reducers, and native human-in-the-loop interrupt/resume semantics.
3. **CrewAI / AutoGen**: Evaluated. Primarily Python ecosystems; would violate our TypeScript-primary language strategy.

# Why
LangGraph JS is the enterprise standard for production agent state machines. It provides native checkpointing (time-travel debugging), state persistence, dynamic branch routing, and first-class TypeScript inference.

# Consequences
- **Positive**: Auditable, deterministic agent flows; clear visualization of agent execution trees in LangSmith; reliable human approval gates before executing external actions.
- **Negative**: Graph compilation and channel reducer syntax have a steeper learning curve than simple procedural scripts.

# Migration / Exit Strategy
LangGraph nodes are standard async TypeScript functions that accept a state object and return partial state updates. These node functions can be executed by any state machine or procedural runner if required.

# Evidence
- LangGraph JS Documentation: `https://langchain-ai.github.io/langgraphjs/`
- Scorecard ranking: 4.94 / 5.0 in `docs/research/scorecard.md`.

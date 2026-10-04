# LangGraph Agent Orchestration Specification

Debo uses **LangGraph JS** (`@langchain/langgraph`) to define and compile all reasoning graphs. This document specifies graph state management, node lifecycles, human approval interrupts, and durable checkpointing.

---

## 1. Core Component Separation

```text
┌─────────────────────────────────────────────────────────────┐
│                   LangGraph JS Runtime                      │
│        (Reasoning, State Flow, Tool Selection, Interrupts)  │
└──────┬──────────────────────┬──────────────────────┬────────┘
       │                      │                      │
       ▼                      ▼                      ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│MemoryProvider│       │   Composio   │       │ Trigger.dev  │
│(Personal     │       │(External Real│       │(Durable Long │
│ Context)     │       │ World Action)│       │ Execution)   │
└──────────────┘       └──────────────┘       └──────────────┘
```

---

## 2. Graph State & Channel Reducers

Graph state is defined using Zod schemas and LangGraph channel annotations in `@debo/agent`:

```typescript
export interface AskDeboState {
  workspaceId: string;
  userId: string;
  threadId: string;
  query: string;
  intent: 'answer' | 'action' | 'summarize' | 'clarify';
  retrievedChunks: Array<{
    chunkId: string;
    sourceId: string;
    content: string;
    score: number;
  }>;
  citations: Array<{
    citationId: string;
    chunkId: string;
    claim: string;
  }>;
  suggestedActions: Array<{
    toolName: string;
    parameters: Record<string, unknown>;
    requiresApproval: boolean;
  }>;
  pendingApprovalId?: string;
  finalAnswer?: string;
  isComplete: boolean;
}
```

---

## 3. Node Execution Lifecycle

### 1. `classify_intent`
Analyzes user input using a fast model (e.g. Llama 3.3 8B or GPT-4o-mini). Routes conditionally to memory retrieval, direct action proposal, or conversation clarification.

### 2. `retrieve_memory`
Queries `MemoryProvider.search()` using semantic vector search and BM25 keywords, scoped unconditionally to `workspaceId`.

### 3. `generate_answer`
Synthesizes the answer using a frontier model (Claude 3.5 Sonnet / Nemotron 70B), instructing the model to embed `[^chunkId]` markers for every factual claim.

### 4. `validate_citations`
A deterministic verification node:
- Verifies that every `[^chunkId]` in the answer was in `retrievedChunks`.
- Strips hallucinated chunk references.
- Generates structured `Citation` records with short-lived pre-signed R2 preview links.

### 5. `request_action_approval` (Human Interrupt)
If an action requires user approval (e.g., sending an email or mutating an external calendar):
- Graph executes `interrupt({ approvalId, action, params })`.
- Graph state is snapshotted to PostgreSQL checkpoint table (`drizzle_checkpointer`).
- The AG-UI protocol emits a `tool_call_confirmation_required` event to the web client.

---

## 4. Checkpointing & Resumption

1. **State Persistence**: State transitions are written to the database using `@langchain/langgraph-checkpoint-postgres` or our Drizzle checkpointer.
2. **Resumption**: When the user clicks "Approve" in the UI, an API call is made with the signed approval token:
   ```typescript
   await graph.resume({
     threadId,
     approvalGranted: true,
     approvalId
   });
   ```
3. **Time-Travel**: Engineers and users can inspect prior checkpoints to review exact prompts, intermediate model thoughts, and tool inputs.

# Agent State Contract Specification

This document defines the normative LangGraph state annotations, channels, and message reducers for `@debo/agent`.

---

## 1. Ask Debo State Schema

```typescript
import { Annotation } from '@langchain/langgraph';

export const AskDeboAnnotation = Annotation.Root({
  workspaceId: Annotation<string>(),
  userId: Annotation<string>(),
  threadId: Annotation<string>(),
  messages: Annotation<Array<{ role: string; content: string }>>({
    reducer: (prev, next) => prev.concat(next),
    default: () => []
  }),
  query: Annotation<string>(),
  intent: Annotation<'answer' | 'action' | 'summarize' | 'clarify'>(),
  retrievedChunks: Annotation<Array<{
    chunkId: string;
    sourceId: string;
    content: string;
    score: number;
    metadata: Record<string, unknown>;
  }>>(),
  citations: Annotation<Array<{
    citationId: string;
    chunkId: string;
    claim: string;
  }>>(),
  proposedAction: Annotation<{
    toolName: string;
    parameters: Record<string, unknown>;
    riskTier: number;
    approvalGranted?: boolean;
  }>(),
  finalAnswer: Annotation<string>(),
  isComplete: Annotation<boolean>()
});

export type AskDeboStateType = typeof AskDeboAnnotation.State;
```

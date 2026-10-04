export interface AgentMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    parameters: Record<string, unknown>;
  }>;
}

export interface RetrievedChunk {
  id: string;
  content: string;
  sourceId?: string;
  score?: number;
}

export interface CitationAssertion {
  chunkId: string;
  claim: string;
  quote: string;
  verified: boolean;
  confidence: number;
}

export interface PendingApproval {
  approvalId: string;
  toolName: string;
  riskTier: 'READ' | 'LOW_WRITE' | 'EXTERNAL_WRITE' | 'DESTRUCTIVE';
  parameters: Record<string, unknown>;
}

export interface AgentState {
  threadId: string;
  workspaceId: string;
  userId: string;
  messages: AgentMessage[];
  query: string;
  plan: string[];
  retrievedChunks: RetrievedChunk[];
  citations: CitationAssertion[];
  pendingApproval: PendingApproval | null;
  finalResponse: string | null;
  stepCount: number;
  isInterrupted: boolean;
  disclaimerAppended: boolean;
}

export function createInitialAgentState(params: {
  threadId?: string;
  workspaceId: string;
  userId: string;
  query: string;
  messages?: AgentMessage[];
}): AgentState {
  return {
    threadId: params.threadId ?? `th_${crypto.randomUUID().replace(/-/g, '')}`,
    workspaceId: params.workspaceId,
    userId: params.userId,
    query: params.query,
    messages: params.messages ?? [{ role: 'user', content: params.query }],
    plan: [],
    retrievedChunks: [],
    citations: [],
    pendingApproval: null,
    finalResponse: null,
    stepCount: 0,
    isInterrupted: false,
    disclaimerAppended: false,
  };
}

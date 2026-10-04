export type StreamEventType =
  'text-delta' | 'citation' | 'approval-requested' | 'tool-call' | 'finish' | 'error';

export interface TextDeltaEvent {
  type: 'text-delta';
  text: string;
}

export interface CitationStreamEvent {
  type: 'citation';
  chunkId: string;
  quote: string;
  confidence: number;
}

export interface ApprovalRequestedStreamEvent {
  type: 'approval-requested';
  approvalId: string;
  toolName: string;
  riskTier: 'READ' | 'LOW_WRITE' | 'EXTERNAL_WRITE' | 'DESTRUCTIVE';
  parameters: Record<string, unknown>;
}

export interface ToolCallStreamEvent {
  type: 'tool-call';
  toolName: string;
  parameters: Record<string, unknown>;
}

export interface FinishStreamEvent {
  type: 'finish';
  totalSteps: number;
  finalText: string;
}

export interface ErrorStreamEvent {
  type: 'error';
  message: string;
}

export type StreamEvent =
  | TextDeltaEvent
  | CitationStreamEvent
  | ApprovalRequestedStreamEvent
  | ToolCallStreamEvent
  | FinishStreamEvent
  | ErrorStreamEvent;

export function encodeStreamEvent(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export function decodeStreamEvent(chunk: string): StreamEvent | null {
  const trimmed = chunk.trim();
  if (!trimmed.startsWith('data:')) {
    return null;
  }
  try {
    const jsonStr = trimmed.replace(/^data:\s*/, '');
    return JSON.parse(jsonStr) as StreamEvent;
  } catch {
    return null;
  }
}

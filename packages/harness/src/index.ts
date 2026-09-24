export type HarnessEventType =
  | "turn.started"
  | "turn.completed"
  | "memory.retrieval"
  | "memory.write"
  | "tool.called"
  | "tool.completed"
  | "voice.interruption"
  | "voice.transcript"
  | "voice.audio.first_byte"
  | "error";

export interface HarnessEvent {
  type: HarnessEventType;
  traceId: string;
  turnId?: string;
  at: string;
  durationMs?: number;
  data?: Record<string, unknown>;
}

export interface HarnessTrace {
  traceId: string;
  sessionId?: string;
  startedAt: string;
  endedAt?: string;
  events: HarnessEvent[];
}

export function createTraceId(prefix = "trc"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createHarnessEvent(
  type: HarnessEventType,
  traceId: string,
  data?: Record<string, unknown>,
): HarnessEvent {
  return {
    type,
    traceId,
    at: new Date().toISOString(),
    data,
  };
}

export function addEvent(
  trace: HarnessTrace,
  event: HarnessEvent,
): HarnessTrace {
  return { ...trace, events: [...trace.events, event] };
}

export function finishTrace(trace: HarnessTrace): HarnessTrace {
  return { ...trace, endedAt: new Date().toISOString() };
}

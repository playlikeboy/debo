import { z } from 'zod';

/**
 * Normative Debo Event Envelope schema matching docs/workflows/event-model.md
 */
export const DeboEventSchema = z.object({
  eventId: z.string().min(1),
  name: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().optional(),
  timestamp: z.string().datetime(),
  idempotencyKey: z.string().min(1),
  payload: z.record(z.unknown()),
});

export type DeboEvent<T = Record<string, unknown>> = {
  eventId: string;
  name: string;
  workspaceId: string;
  userId?: string;
  timestamp: string;
  idempotencyKey: string;
  payload: T;
};

// Typed Payloads
export interface SourceCreatedPayload {
  sourceId: string;
  storageKey: string;
  mimeType: string;
  byteSize: number;
}

export interface SourceDeletedPayload {
  sourceId: string;
  storageKey?: string;
}

export interface DocumentProcessedPayload {
  documentId: string;
  sourceId: string;
  pageCount: number;
  markdownKey: string;
  boundingBoxesKey?: string;
}

export interface MemoryCreatedPayload {
  memoryId: string;
  content: string;
  sourceId?: string;
}

export interface ConnectorSyncPayload {
  connectionId: string;
  provider: string;
  entityTypes?: string[];
}

export interface ApprovalRequestedPayload {
  approvalId: string;
  action: string;
  riskTier: 'READ' | 'LOW_WRITE' | 'EXTERNAL_WRITE' | 'DESTRUCTIVE';
  metadata: Record<string, unknown>;
}

export interface ApprovalResolvedPayload {
  approvalId: string;
  status: 'APPROVED' | 'REJECTED';
  resolvedByUserId: string;
  reason?: string;
}

/**
 * Creates a valid, strictly typed DeboEvent envelope.
 */
export function createDeboEvent<T extends Record<string, unknown>>(params: {
  name: string;
  workspaceId: string;
  userId?: string;
  payload: T;
  idempotencyKey?: string;
  eventId?: string;
}): DeboEvent<T> {
  const eventId = params.eventId ?? `evt_${crypto.randomUUID().replace(/-/g, '')}`;
  const timestamp = new Date().toISOString();
  const idempotencyKey = params.idempotencyKey ?? `${params.name}:${params.workspaceId}:${eventId}`;

  return {
    eventId,
    name: params.name,
    workspaceId: params.workspaceId,
    userId: params.userId,
    timestamp,
    idempotencyKey,
    payload: params.payload,
  };
}

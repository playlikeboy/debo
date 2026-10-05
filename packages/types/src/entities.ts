/**
 * Debo Core Domain Entities
 * Strictly scoped by workspaceId.
 */

export type TenantRole = 'owner' | 'admin' | 'member' | 'guest';

export interface TenantContext {
  workspaceId: string;
  userId: string;
  role: TenantRole;
}

export interface User {
  id: string; // usr_*
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string; // wsp_*
  name: string;
  slug: string;
  ownerId: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string; // wmb_*
  workspaceId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  createdAt: string;
}

export type SourceType =
  'journal' | 'note' | 'pdf' | 'audio' | 'image' | 'web' | 'email' | 'connector';
export type ProcessingStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface Source {
  id: string; // src_*
  workspaceId: string;
  userId: string;
  type: SourceType;
  title: string;
  rawStorageKey?: string;
  status: ProcessingStatus;
  mimeType: string;
  sizeBytes?: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SourceChunk {
  id: string; // chn_*
  sourceId: string;
  workspaceId: string;
  index: number;
  content: string;
  tokenCount: number;
  provenance: {
    pageNumber?: number;
    startChar?: number;
    endChar?: number;
    boundingBox?: { x1: number; y1: number; x2: number; y2: number };
    audioTimecode?: { startSec: number; endSec: number };
  };
  createdAt: string;
}

export type MemoryType = 'semantic' | 'episodic' | 'declarative' | 'procedural';

export interface Memory {
  id: string; // mem_*
  workspaceId: string;
  sourceId?: string;
  type: MemoryType;
  content: string;
  confidence: number;
  validFrom?: string;
  validUntil?: string;
  supersededBy?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

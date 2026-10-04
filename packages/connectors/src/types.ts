import type { TenantContext } from '@debo/types';

export type ConnectorCategory = 'productivity' | 'communication' | 'developer' | 'crm';

export interface ConnectorToolDefinition {
  name: string;
  description: string;
  riskTier: 0 | 1 | 2 | 3;
  inputSchema: Record<string, unknown>;
}

export interface ExecuteActionParams {
  context: TenantContext;
  connectionId: string;
  toolName: string;
  parameters: Record<string, unknown>;
  approvalId?: string; // Required if tool riskTier >= 2
}

export interface ExecuteActionResult {
  success: boolean;
  data?: Record<string, unknown>;
  errorMessage?: string;
  rawResponseStatus?: number;
}

export interface ActionConnector {
  slug: string;
  displayName: string;
  category: ConnectorCategory;
  listTools(connectionId: string): Promise<ConnectorToolDefinition[]>;
  executeAction(params: ExecuteActionParams): Promise<ExecuteActionResult>;
}

export interface ConnectionRecord {
  id: string; // con_<ulid>
  workspaceId: string;
  userId: string;
  connectorSlug: string;
  externalAccountId: string;
  status: 'CONNECTED' | 'EXPIRED' | 'REVOKED' | 'ERROR';
  scopesGranted: string[];
  lastSyncedAt?: string;
  expiresAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncRecordsResult {
  recordsFetched: number;
  hasMore: boolean;
  nextCursor?: string;
  data: Array<Record<string, unknown>>;
}

export interface SyncConnector {
  slug: string;
  displayName: string;
  sync(
    context: TenantContext,
    connectionId: string,
    model: string,
    cursor?: string,
  ): Promise<SyncRecordsResult>;
}

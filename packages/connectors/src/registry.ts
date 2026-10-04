import { TenantMismatchError, UnauthorizedError } from '@debo/types';
import type { TenantContext } from '@debo/types';
import { ActionConnector, ConnectionRecord, ExecuteActionResult, SyncConnector } from './types';

export class ConnectorRegistry {
  private actionConnectors = new Map<string, ActionConnector>();
  private syncConnectors = new Map<string, SyncConnector>();
  private connections = new Map<string, ConnectionRecord>();

  registerActionConnector(connector: ActionConnector): void {
    this.actionConnectors.set(connector.slug, connector);
  }

  registerSyncConnector(connector: SyncConnector): void {
    this.syncConnectors.set(connector.slug, connector);
  }

  getActionConnector(slug: string): ActionConnector | undefined {
    return this.actionConnectors.get(slug);
  }

  getSyncConnector(slug: string): SyncConnector | undefined {
    return this.syncConnectors.get(slug);
  }

  createConnection(
    context: TenantContext,
    params: {
      connectorSlug: string;
      externalAccountId: string;
      scopesGranted?: string[];
    },
  ): ConnectionRecord {
    if (!context.workspaceId) {
      throw new UnauthorizedError('workspaceId required to create a connection');
    }

    const id = `con_${crypto.randomUUID().replace(/-/g, '')}`;
    const record: ConnectionRecord = {
      id,
      workspaceId: context.workspaceId,
      userId: context.userId,
      connectorSlug: params.connectorSlug,
      externalAccountId: params.externalAccountId,
      status: 'CONNECTED',
      scopesGranted: params.scopesGranted ?? [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.connections.set(id, record);
    return record;
  }

  getConnection(context: TenantContext, connectionId: string): ConnectionRecord {
    const conn = this.connections.get(connectionId);
    if (!conn) {
      throw new Error(`Connection '${connectionId}' not found`);
    }

    // Strict tenant isolation check
    if (conn.workspaceId !== context.workspaceId) {
      throw new TenantMismatchError(conn.workspaceId, context.workspaceId);
    }

    return conn;
  }

  disconnect(context: TenantContext, connectionId: string): ConnectionRecord {
    const conn = this.getConnection(context, connectionId);
    conn.status = 'REVOKED';
    conn.updatedAt = new Date().toISOString();
    return conn;
  }

  async executeAction(params: {
    context: TenantContext;
    connectionId: string;
    toolName: string;
    parameters: Record<string, unknown>;
    approvalId?: string;
  }): Promise<ExecuteActionResult> {
    const conn = this.getConnection(params.context, params.connectionId);
    if (conn.status !== 'CONNECTED') {
      return {
        success: false,
        errorMessage: `Connection '${params.connectionId}' is ${conn.status}, cannot execute action`,
      };
    }

    const connector = this.actionConnectors.get(conn.connectorSlug);
    if (!connector) {
      return {
        success: false,
        errorMessage: `Action connector '${conn.connectorSlug}' is not registered`,
      };
    }

    return await connector.executeAction({
      context: params.context,
      connectionId: params.connectionId,
      toolName: params.toolName,
      parameters: params.parameters,
      approvalId: params.approvalId,
    });
  }
}

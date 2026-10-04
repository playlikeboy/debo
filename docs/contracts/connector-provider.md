# Connector Provider Contract Specification

This document defines the interface between `@debo/connectors` and external action platforms (Composio / Nango).

---

## 1. Action Connector Interface

```typescript
export interface ActionConnector {
  slug: string; // e.g. 'google-calendar', 'github'
  displayName: string;
  category: 'productivity' | 'communication' | 'developer' | 'crm';

  /**
   * Discovers available action tools for an authorized connection.
   */
  listTools(connectionId: string): Promise<ConnectorToolDefinition[]>;

  /**
   * Executes a specific tool action through the connector.
   */
  executeAction(params: ExecuteActionParams): Promise<ExecuteActionResult>;
}

export interface ConnectorToolDefinition {
  name: string;
  description: string;
  riskTier: 0 | 1 | 2 | 3;
  inputSchema: Record<string, unknown>; // JSON Schema
}

export interface ExecuteActionParams {
  workspaceId: string;
  userId: string;
  connectionId: string;
  toolName: string;
  parameters: Record<string, unknown>;
  approvalId?: string; // Mandatory if riskTier >= 2
}

export interface ExecuteActionResult {
  success: boolean;
  data?: Record<string, unknown>;
  errorMessage?: string;
  rawResponseStatus?: number;
}
```

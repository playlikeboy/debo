import { ForbiddenError } from '@debo/types';
import {
  ActionConnector,
  ConnectorCategory,
  ConnectorToolDefinition,
  ExecuteActionParams,
  ExecuteActionResult,
} from './types';

export interface ComposioClientConfig {
  apiKey?: string;
  baseUrl?: string;
}

export class ComposioConnector implements ActionConnector {
  public readonly slug: string;
  public readonly displayName: string;
  public readonly category: ConnectorCategory;
  public readonly clientConfig: ComposioClientConfig;
  private tools: Map<string, ConnectorToolDefinition> = new Map();

  public get config(): ComposioClientConfig {
    return this.clientConfig;
  }

  constructor(
    slug: string,
    displayName: string,
    category: ConnectorCategory,
    clientConfig: ComposioClientConfig = {},
    customTools?: ConnectorToolDefinition[],
  ) {
    this.slug = slug;
    this.displayName = displayName;
    this.category = category;
    this.clientConfig = clientConfig;

    if (customTools) {
      for (const t of customTools) {
        this.tools.set(t.name, t);
      }
    } else {
      // Default toolset based on slug
      this.populateDefaultTools(slug);
    }
  }

  private populateDefaultTools(slug: string): void {
    if (slug === 'github') {
      this.tools.set('get_issue', {
        name: 'get_issue',
        description: 'Fetch a GitHub issue by number',
        riskTier: 0,
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string' },
            repo: { type: 'string' },
            issue_number: { type: 'number' },
          },
        },
      });
      this.tools.set('create_issue', {
        name: 'create_issue',
        description: 'Create a new issue on a GitHub repository',
        riskTier: 2,
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string' },
            repo: { type: 'string' },
            title: { type: 'string' },
            body: { type: 'string' },
          },
        },
      });
      this.tools.set('delete_repo', {
        name: 'delete_repo',
        description: 'Delete an entire repository',
        riskTier: 3,
        inputSchema: {
          type: 'object',
          properties: { owner: { type: 'string' }, repo: { type: 'string' } },
        },
      });
    } else if (slug === 'google-calendar') {
      this.tools.set('list_events', {
        name: 'list_events',
        description: 'List upcoming calendar events',
        riskTier: 0,
        inputSchema: { type: 'object', properties: { maxResults: { type: 'number' } } },
      });
      this.tools.set('create_event', {
        name: 'create_event',
        description: 'Schedule a new calendar meeting or event',
        riskTier: 2,
        inputSchema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            startTime: { type: 'string' },
            endTime: { type: 'string' },
          },
        },
      });
    } else {
      // Generic read tool
      this.tools.set('query', {
        name: 'query',
        description: `Query data from ${this.displayName}`,
        riskTier: 0,
        inputSchema: { type: 'object' },
      });
    }
  }

  async listTools(_connectionId: string): Promise<ConnectorToolDefinition[]> {
    return Array.from(this.tools.values());
  }

  async executeAction(params: ExecuteActionParams): Promise<ExecuteActionResult> {
    const tool = this.tools.get(params.toolName);
    if (!tool) {
      return {
        success: false,
        errorMessage: `Tool '${params.toolName}' is not supported by connector '${this.slug}'`,
      };
    }

    // Enforce Non-LLM Authority on Tier 2 / Tier 3 actions
    if (tool.riskTier >= 2 && !params.approvalId) {
      throw new ForbiddenError(
        `Action '${params.toolName}' has risk tier ${tool.riskTier} and requires human approvalId before execution`,
      );
    }

    // Mock/dry-run or real dispatch using clientConfig
    return {
      success: true,
      data: {
        executed: true,
        connector: this.slug,
        tool: params.toolName,
        connectionId: params.connectionId,
        workspaceId: params.context.workspaceId,
        approvalId: params.approvalId,
        output: params.parameters,
      },
      rawResponseStatus: 200,
    };
  }
}

import { MemoryService } from '@debo/memory';
import { R2StorageService } from '@debo/storage';
import type { TenantContext } from '@debo/types';
import { JSON_RPC_ERRORS, JsonRpcRequest, JsonRpcResponse, MCP_PROTOCOL_VERSION } from './protocol';
import { MemoryRateLimiter } from './ratelimit';
import { DEBO_MCP_TOOLS, ToolDispatcher } from './tools';
import { DEBO_MCP_RESOURCES, DEBO_MCP_RESOURCE_TEMPLATES, resolveFrameResource } from './frames';

export interface McpServerOptions {
  memoryService: MemoryService;
  storageService?: R2StorageService;
  rateLimiter?: MemoryRateLimiter;
  authResolver?: (authHeader: string | null) => Promise<TenantContext | null>;
}

export class DeboMcpServer {
  public readonly toolDispatcher: ToolDispatcher;
  public readonly rateLimiter: MemoryRateLimiter;
  private readonly authResolver?: (authHeader: string | null) => Promise<TenantContext | null>;

  constructor(options: McpServerOptions) {
    this.toolDispatcher = new ToolDispatcher(options.memoryService, options.storageService);
    this.rateLimiter = options.rateLimiter ?? new MemoryRateLimiter();
    this.authResolver = options.authResolver;
  }

  async handleMessage(message: JsonRpcRequest, context: TenantContext): Promise<JsonRpcResponse> {
    const { id, method, params } = message;

    switch (method) {
      case 'initialize': {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: MCP_PROTOCOL_VERSION,
            serverInfo: {
              name: 'debo-mcp',
              version: '0.1.0',
            },
            capabilities: {
              tools: {},
              resources: {},
              prompts: {},
            },
          },
        };
      }

      case 'notifications/initialized': {
        // Notification returns no response
        return { jsonrpc: '2.0', id, result: {} };
      }

      case 'ping': {
        return { jsonrpc: '2.0', id, result: {} };
      }

      case 'tools/list': {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            tools: DEBO_MCP_TOOLS,
          },
        };
      }

      case 'tools/call': {
        const toolName = String(params?.name || '');
        const args = (params?.arguments as Record<string, unknown>) || {};

        const callResult = await this.toolDispatcher.dispatch(context, toolName, args);
        return {
          jsonrpc: '2.0',
          id,
          result: callResult,
        };
      }

      case 'resources/list': {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            resources: DEBO_MCP_RESOURCES,
          },
        };
      }

      case 'resources/templates/list': {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            resourceTemplates: DEBO_MCP_RESOURCE_TEMPLATES,
          },
        };
      }

      case 'resources/read': {
        const uri = String(params?.uri || '');
        const resolved = resolveFrameResource(uri);

        if (!resolved) {
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: JSON_RPC_ERRORS.INVALID_PARAMS,
              message: `Resource not found: ${uri}`,
            },
          };
        }

        return {
          jsonrpc: '2.0',
          id,
          result: {
            contents: [
              {
                uri: resolved.uri,
                mimeType: resolved.mimeType,
                text: resolved.text,
              },
            ],
          },
        };
      }

      default: {
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: JSON_RPC_ERRORS.METHOD_NOT_FOUND,
            message: `Method not found: ${method}`,
          },
        };
      }
    }
  }

  createHttpHandler(): (req: Request) => Promise<Response> {
    return async (req: Request): Promise<Response> => {
      const url = new URL(req.url);

      if (req.method === 'GET' && url.pathname === '/health') {
        return new Response(
          JSON.stringify({
            status: 'healthy',
            service: 'debo-mcp',
            protocolVersion: MCP_PROTOCOL_VERSION,
            timestamp: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }

      if (url.pathname === '/mcp') {
        if (req.method === 'GET') {
          return new Response(
            JSON.stringify({
              protocolVersion: MCP_PROTOCOL_VERSION,
              server: 'debo-mcp',
              transport: 'streamable-http',
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          );
        }

        if (req.method === 'POST') {
          // Authentication resolution
          const authHeader = req.headers.get('Authorization');
          let context: TenantContext | null = null;

          if (this.authResolver) {
            context = await this.authResolver(authHeader);
          } else if (authHeader?.startsWith('Bearer ')) {
            // Default token structure: Bearer key_<workspaceId>_<userId>
            const token = authHeader.replace('Bearer ', '').trim();
            const parts = token.split('_');
            if (parts.length >= 3) {
              context = {
                workspaceId: parts[1]!,
                userId: parts[2]!,
                role: 'member',
              };
            }
          }

          if (!context) {
            return new Response(
              JSON.stringify({
                jsonrpc: '2.0',
                id: null,
                error: {
                  code: JSON_RPC_ERRORS.UNAUTHORIZED,
                  message: 'Missing or invalid Bearer authentication token',
                },
              }),
              {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
              },
            );
          }

          // Rate limiting check
          const rateKey = `${context.workspaceId}:${context.userId}`;
          const rateCheck = this.rateLimiter.check(rateKey);
          if (!rateCheck.allowed) {
            return new Response(
              JSON.stringify({
                jsonrpc: '2.0',
                id: null,
                error: {
                  code: JSON_RPC_ERRORS.RATE_LIMITED,
                  message: 'Rate limit exceeded (60 requests/minute). Please back off.',
                },
              }),
              {
                status: 429,
                headers: {
                  'Content-Type': 'application/json',
                  'Retry-After': Math.ceil(rateCheck.resetMs / 1000).toString(),
                },
              },
            );
          }

          try {
            const body = (await req.json()) as JsonRpcRequest;
            const response = await this.handleMessage(body, context);
            return new Response(JSON.stringify(response), {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'X-Debo-Workspace': context.workspaceId,
              },
            });
          } catch (err: unknown) {
            return new Response(
              JSON.stringify({
                jsonrpc: '2.0',
                id: null,
                error: {
                  code: JSON_RPC_ERRORS.PARSE_ERROR,
                  message: err instanceof Error ? err.message : 'Malformed JSON-RPC payload',
                },
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              },
            );
          }
        }
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    };
  }
}

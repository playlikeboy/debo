import { describe, expect, it } from 'bun:test';
import { DeboMcpServer, MCP_PROTOCOL_VERSION } from '@debo/mcp';
import { MemoryRateLimiter } from '@debo/mcp';
import { DegradedMemoryProvider, MemoryService } from '@debo/memory';

describe('Debo MCP Server (apps/mcp)', () => {
  const memoryService = new MemoryService(new DegradedMemoryProvider());
  const server = new DeboMcpServer({ memoryService });
  const handler = server.createHttpHandler();

  it('responds to /health with protocol metadata', async () => {
    const req = new Request('http://localhost:8080/health');
    const res = await handler(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('healthy');
    expect(body.protocolVersion).toBe(MCP_PROTOCOL_VERSION);
  });

  it('enforces Bearer authentication and rejects unauthenticated requests', async () => {
    const req = new Request('http://localhost:8080/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'ping',
      }),
    });

    const res = await handler(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error?.message).toContain('authentication token');
  });

  it('executes official initialize handshake with 2026-07-28 protocol version', async () => {
    const req = new Request('http://localhost:8080/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer key_ws100_usr200',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'init_1',
        method: 'initialize',
        params: {
          protocolVersion: '2026-07-28',
          clientInfo: { name: 'test-client', version: '1.0.0' },
        },
      }),
    });

    const res = await handler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.result.protocolVersion).toBe('2026-07-28');
    expect(body.result.serverInfo.name).toBe('debo-mcp');
    expect(body.result.capabilities.tools).toBeDefined();
  });

  it('lists all standard normative Debo tools via tools/list', async () => {
    const req = new Request('http://localhost:8080/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer key_ws100_usr200',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'list_1',
        method: 'tools/list',
      }),
    });

    const res = await handler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    const toolNames = body.result.tools.map((t: { name: string }) => t.name);

    expect(toolNames).toContain('debo_search_memory');
    expect(toolNames).toContain('debo_recall');
    expect(toolNames).toContain('debo_get_memory');
    expect(toolNames).toContain('debo_save_memory');
    expect(toolNames).toContain('debo_forget_memory');
    expect(toolNames).toContain('debo_get_source');
  });

  it('calls debo_save_memory and debo_search_memory with untrusted source delimiters', async () => {
    // 1. Save memory
    const saveReq = new Request('http://localhost:8080/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer key_ws100_usr200',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'save_1',
        method: 'tools/call',
        params: {
          name: 'debo_save_memory',
          arguments: {
            content: 'Debo personal AI OS supports Streamable HTTP MCP transport.',
          },
        },
      }),
    });

    const saveRes = await handler(saveReq);
    expect(saveRes.status).toBe(200);
    const saveBody = await saveRes.json();
    expect(saveBody.result.content[0]?.text).toContain('saved');

    // 2. Search memory
    const searchReq = new Request('http://localhost:8080/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer key_ws100_usr200',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'search_1',
        method: 'tools/call',
        params: {
          name: 'debo_search_memory',
          arguments: {
            query: 'Streamable HTTP MCP',
          },
        },
      }),
    });

    const searchRes = await handler(searchReq);
    expect(searchRes.status).toBe(200);
    const searchBody = await searchRes.json();
    const responseText = searchBody.result.content[0]?.text;

    // Verify untrusted source delimiter wrapping
    expect(responseText).toContain('<untrusted_source_data>');
    expect(responseText).toContain('</untrusted_source_data>');
    expect(responseText).toContain('Streamable HTTP MCP transport');

    // 3. Verify tenant isolation: searching from another workspace returns 0 results
    const otherWorkspaceReq = new Request('http://localhost:8080/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer key_wsOTHER_usr300',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'search_cross',
        method: 'tools/call',
        params: {
          name: 'debo_search_memory',
          arguments: {
            query: 'Streamable HTTP MCP',
          },
        },
      }),
    });

    const otherRes = await handler(otherWorkspaceReq);
    const otherBody = await otherRes.json();
    expect(otherBody.result.content[0]?.text).toContain('[]');
  });

  it('enforces rate limiting when request limit is exceeded', async () => {
    const tightLimiter = new MemoryRateLimiter({ limit: 2, windowMs: 10000 });
    const limitedServer = new DeboMcpServer({
      memoryService,
      rateLimiter: tightLimiter,
    });
    const limitedHandler = limitedServer.createHttpHandler();

    const makeReq = () =>
      new Request('http://localhost:8080/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer key_wsRate_usrRate',
        },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'ping' }),
      });

    // Request 1 and 2 succeed
    const res1 = await limitedHandler(makeReq());
    expect(res1.status).toBe(200);
    const res2 = await limitedHandler(makeReq());
    expect(res2.status).toBe(200);

    // Request 3 is rate limited
    const res3 = await limitedHandler(makeReq());
    expect(res3.status).toBe(429);
    const body3 = await res3.json();
    expect(body3.error?.code).toBe(-32029);
  });

  it('lists visual frame resources via resources/list and templates via resources/templates/list (Phase 10: MCP Apps)', async () => {
    // 1. resources/list
    const listReq = new Request('http://localhost:8080/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer key_ws100_usr200',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'res_list_1',
        method: 'resources/list',
      }),
    });

    const listRes = await handler(listReq);
    expect(listRes.status).toBe(200);
    const listBody = await listRes.json();
    expect(listBody.result.resources).toBeDefined();
    expect(listBody.result.resources.length).toBeGreaterThanOrEqual(3);

    const uris = listBody.result.resources.map((r: { uri: string }) => r.uri);
    expect(uris).toContain('ui://debo/frames/citation/sample');
    expect(uris).toContain('ui://debo/frames/graph/sample');
    expect(uris).toContain('ui://debo/frames/approval/sample');

    // 2. resources/templates/list
    const tplReq = new Request('http://localhost:8080/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer key_ws100_usr200',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'res_tpl_1',
        method: 'resources/templates/list',
      }),
    });

    const tplRes = await handler(tplReq);
    expect(tplRes.status).toBe(200);
    const tplBody = await tplRes.json();
    expect(tplBody.result.resourceTemplates).toBeDefined();
    expect(tplBody.result.resourceTemplates.length).toBeGreaterThanOrEqual(3);
  });

  it('renders sandboxed HTML/SVG frame resources via resources/read (Phase 10: MCP Apps)', async () => {
    // 1. Citation Frame
    const citationReq = new Request('http://localhost:8080/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer key_ws100_usr200',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'res_read_citation',
        method: 'resources/read',
        params: {
          uri: 'ui://debo/frames/citation?quote=Grounding%20quote&sourceTitle=Report.pdf&confidence=0.95',
        },
      }),
    });

    const citationRes = await handler(citationReq);
    expect(citationRes.status).toBe(200);
    const citationBody = await citationRes.json();
    const citationHtml = citationBody.result.contents[0]?.text;
    expect(citationHtml).toContain('Source Grounding Inspector');
    expect(citationHtml).toContain('95% Verified');
    expect(citationHtml).toContain('Report.pdf');

    // 2. Memory Graph Frame
    const graphReq = new Request('http://localhost:8080/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer key_ws100_usr200',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'res_read_graph',
        method: 'resources/read',
        params: {
          uri: 'ui://debo/frames/graph/sample',
        },
      }),
    });

    const graphRes = await handler(graphReq);
    expect(graphRes.status).toBe(200);
    const graphBody = await graphRes.json();
    const graphHtml = graphBody.result.contents[0]?.text;
    expect(graphHtml).toContain('<svg');
    expect(graphHtml).toContain('Debo Personal AI');

    // 3. Approval Gate Frame
    const approvalReq = new Request('http://localhost:8080/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer key_ws100_usr200',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'res_read_approval',
        method: 'resources/read',
        params: {
          uri: 'ui://debo/frames/approval?actionId=act_123&toolName=gmail_delete&riskTier=TIER_3_DESTRUCTIVE',
        },
      }),
    });

    const approvalRes = await handler(approvalReq);
    expect(approvalRes.status).toBe(200);
    const approvalBody = await approvalRes.json();
    const approvalHtml = approvalBody.result.contents[0]?.text;
    expect(approvalHtml).toContain('Action Approval Required');
    expect(approvalHtml).toContain('TIER_3_DESTRUCTIVE');
    expect(approvalHtml).toContain('act_123');

    // 4. Invalid Resource URI returns error
    const notFoundReq = new Request('http://localhost:8080/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer key_ws100_usr200',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'res_not_found',
        method: 'resources/read',
        params: {
          uri: 'ui://debo/frames/nonexistent',
        },
      }),
    });

    const notFoundRes = await handler(notFoundReq);
    expect(notFoundRes.status).toBe(200);
    const notFoundBody = await notFoundRes.json();
    expect(notFoundBody.error?.code).toBe(-32602);
  });
});

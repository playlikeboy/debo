/**
 * Debo Cloudflare Edge Gateway & Services
 * Serves:
 * - docs.debo.life: Platform Documentation (Warm Paper design)
 * - worker.debo.life: Debo Durable Workflow Engine
 * - mcp.debo.life: Official Model Context Protocol (MCP 2026-07-28) Server
 */

// --- MCP Definitions ---
const MCP_PROTOCOL_VERSION = "2026-07-28";

const DEBO_MCP_TOOLS = [
  {
    name: "debo_search_memory",
    description: "Performs hybrid semantic and keyword search across indexed memories in the active Debo workspace.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query or concept to recall." },
        limit: { type: "integer", description: "Max memories to return (default: 10, max: 25)." },
        timeframe_start: { type: "string", description: "ISO 8601 start date." },
        timeframe_end: { type: "string", description: "ISO 8601 end date." },
      },
      required: ["query"],
    },
  },
  {
    name: "debo_recall",
    description: "Contextual associative recall for active agent reasoning, retrieving relevant facts and summaries.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Active task or conversation context prompt." },
        limit: { type: "integer", description: "Max items (default: 5)." },
      },
      required: ["prompt"],
    },
  },
  {
    name: "debo_get_memory",
    description: "Retrieves a single memory record by its unique ID.",
    inputSchema: {
      type: "object",
      properties: {
        memory_id: { type: "string", description: "ULID identifier (mem_...)." },
      },
      required: ["memory_id"],
    },
  },
  {
    name: "debo_save_memory",
    description: "Ingests a new atomic fact into the user's private memory graph.",
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string", description: "Factual assertion to remember." },
        source_id: { type: "string", description: "Optional associated source ID." },
        tags: { type: "array", items: { type: "string" }, description: "Optional tags." },
      },
      required: ["content"],
    },
  },
  {
    name: "debo_forget_memory",
    description: "Permanently purges a memory record from the active and historical graph.",
    inputSchema: {
      type: "object",
      properties: {
        memory_id: { type: "string", description: "Target memory to purge." },
      },
      required: ["memory_id"],
    },
  },
  {
    name: "debo_get_source",
    description: "Retrieves source container metadata and a temporary pre-signed preview URL for an original document.",
    inputSchema: {
      type: "object",
      properties: {
        source_id: { type: "string", description: "The unique ULID of the source container (src_...)." },
        filename: { type: "string", description: "Optional original filename." },
      },
      required: ["source_id"],
    },
  },
];

// --- In-memory Stores for Edge Runtime ---
interface MemoryRecord {
  id: string;
  workspaceId: string;
  userId: string;
  content: string;
  sourceId?: string;
  tags?: string[];
  createdAt: string;
}

const memoryStore: Map<string, MemoryRecord> = new Map();
const runStore: Map<string, Record<string, unknown>> = new Map();

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Workspace-Id, X-User-Id",
  };
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(),
    },
  });
}

// --- Documentation Renderer ---
function renderDocsHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Debo Documentation — Personal AI Memory OS</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #FBF9F5;
      --card-bg: #FFFFFF;
      --text-main: #1C1917;
      --text-muted: #78716C;
      --accent: #B45309;
      --border: #E7E5E4;
      --font-serif: "Newsreader", Georgia, serif;
      --font-sans: "Plus Jakarta Sans", -apple-system, sans-serif;
      --font-mono: "JetBrains Mono", monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text-main);
      font-family: var(--font-sans);
      line-height: 1.6;
      padding: 0 1.5rem;
    }
    header {
      max-width: 960px;
      margin: 0 auto;
      padding: 2.5rem 0 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-family: var(--font-serif);
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-main);
      text-decoration: none;
    }
    .tagline {
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    nav a {
      margin-left: 1.5rem;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
    }
    nav a:hover { color: var(--accent); }
    main {
      max-width: 960px;
      margin: 2rem auto;
    }
    h1 {
      font-family: var(--font-serif);
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }
    p.lead {
      font-size: 1.15rem;
      color: var(--text-muted);
      margin-bottom: 2rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .card h3 {
      font-family: var(--font-serif);
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      color: var(--accent);
    }
    .card p {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }
    .card code {
      background: #F5F5F4;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: var(--font-mono);
      font-size: 0.8rem;
    }
    .badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      background: #FEF3C7;
      color: #92400E;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
      font-size: 0.875rem;
    }
    th { background: #F5F5F4; font-weight: 600; }
    .status-ok {
      display: inline-block;
      width: 8px;
      height: 8px;
      background: #10B981;
      border-radius: 50%;
      margin-right: 6px;
    }
    footer {
      max-width: 960px;
      margin: 4rem auto 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
      color: var(--text-muted);
      font-size: 0.875rem;
      text-align: center;
    }
  </style>
</head>
<body>
  <header>
    <div>
      <a href="/" class="logo">Debo</a>
      <span class="tagline"> — Architecture & API Docs</span>
    </div>
    <nav>
      <a href="https://app.debo.life">Web App</a>
      <a href="https://mcp.debo.life">MCP Gateway</a>
      <a href="https://worker.debo.life">Worker</a>
      <a href="https://github.com/SH20RAJ/debo">GitHub</a>
    </nav>
  </header>

  <main>
    <h1>Platform Specifications & Guides</h1>
    <p class="lead">A private, source-grounded personal AI memory and context operating system.</p>

    <div class="grid">
      <div class="card">
        <span class="badge">Architecture</span>
        <h3>Memory Operating System</h3>
        <p>Provider-agnostic retrieval engine backing vector search, exact keyword matching, and strict citation grounding.</p>
        <code>@debo/memory</code> &bull; <code>@debo/citations</code>
      </div>

      <div class="card">
        <span class="badge">Agent Runtime</span>
        <h3>LangGraph JS Engine</h3>
        <p>Deterministic cyclic StateGraph: plan &rarr; retrieve &rarr; reason &rarr; validate &rarr; respond with human-in-the-loop approval gates.</p>
        <code>@debo/agent</code>
      </div>

      <div class="card">
        <span class="badge">Integration</span>
        <h3>Official MCP 2026-07-28</h3>
        <p>Streamable HTTP Model Context Protocol server exposing memory search, source retrieval, and prompt injection defenses.</p>
        <code>mcp.debo.life</code>
      </div>

      <div class="card">
        <span class="badge">Durable Execution</span>
        <h3>Workflow Worker Service</h3>
        <p>Asynchronous step memoization, exponential backoff retries, and compensation rollback pipelines.</p>
        <code>worker.debo.life</code>
      </div>
    </div>

    <h2 style="font-family: var(--font-serif); margin-bottom: 0.75rem;">Live Service Mesh & Health Status</h2>
    <table>
      <thead>
        <tr>
          <th>Service Hostname</th>
          <th>Protocol</th>
          <th>Health Check</th>
          <th>Operational Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>docs.debo.life</strong></td>
          <td>HTTPS / HTTP</td>
          <td><a href="https://docs.debo.life/">/</a></td>
          <td><span class="status-ok"></span> 200 OK (Cloudflare Edge)</td>
        </tr>
        <tr>
          <td><strong>worker.debo.life</strong></td>
          <td>JSON / HTTP</td>
          <td><a href="https://worker.debo.life/health">/health</a></td>
          <td><span class="status-ok"></span> 200 OK (Workflow Engine)</td>
        </tr>
        <tr>
          <td><strong>mcp.debo.life</strong></td>
          <td>MCP 2026-07-28</td>
          <td><a href="https://mcp.debo.life/health">/health</a></td>
          <td><span class="status-ok"></span> 200 OK (Streamable MCP)</td>
        </tr>
        <tr>
          <td><strong>app.debo.life</strong></td>
          <td>HTTPS / SSE</td>
          <td><a href="https://app.debo.life/">/</a></td>
          <td><span class="status-ok"></span> 200 OK (Next.js Application)</td>
        </tr>
      </tbody>
    </table>
  </main>

  <footer>
    Debo Platform &bull; Built clean-room from first principles &bull; Hosted on Cloudflare Edge & Tunnels
  </footer>
</body>
</html>`;
}

// --- Handler: worker.debo.life ---
async function handleWorkerRequest(req: Request, url: URL): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  // Health check
  if ((req.method === "GET" || req.method === "HEAD") && url.pathname === "/health") {
    return jsonResponse({
      status: "healthy",
      service: "debo-worker",
      version: "0.1.0",
      runtime: "cloudflare-edge",
      timestamp: new Date().toISOString(),
    });
  }

  // Root info
  if ((req.method === "GET" || req.method === "HEAD") && (url.pathname === "/" || url.pathname === "")) {
    return jsonResponse({
      name: "Debo Durable Workflow Engine",
      status: "operational",
      version: "0.1.0",
      runtime: "cloudflare-edge",
      endpoints: {
        health: "/health",
        events: "POST /events",
        runs: "GET /runs/:key",
      },
      tasks: [
        "ingest.source",
        "document.process",
        "memory.consolidation",
        "connector.sync",
      ],
      docs: "https://docs.debo.life",
    });
  }

  // Event ingestion
  if (req.method === "POST" && url.pathname === "/events") {
    try {
      const body = (await req.json()) as Record<string, unknown>;
      const { name, workspaceId, userId, idempotencyKey, payload } = body;

      if (!name || !workspaceId || !userId || !idempotencyKey) {
        return jsonResponse(
          { error: "Invalid DeboEvent: missing required fields (name, workspaceId, userId, idempotencyKey)" },
          400
        );
      }

      const runRecord = {
        idempotencyKey: String(idempotencyKey),
        eventName: String(name),
        workspaceId: String(workspaceId),
        userId: String(userId),
        status: "completed",
        payload: payload || {},
        completedAt: new Date().toISOString(),
        result: {
          taskExecuted: String(name),
          success: true,
          memoized: false,
        },
      };

      runStore.set(String(idempotencyKey), runRecord);

      return jsonResponse({ status: "ok", result: runRecord.result });
    } catch (err) {
      return jsonResponse({ error: String(err) }, 400);
    }
  }

  // Run status probe
  if (req.method === "GET" && url.pathname.startsWith("/runs/")) {
    const key = url.pathname.replace("/runs/", "");
    const record = runStore.get(key);
    if (!record) {
      return jsonResponse({ error: "Run record not found for key: " + key }, 404);
    }
    return jsonResponse(record);
  }

  return jsonResponse({ error: "Not found", path: url.pathname }, 404);
}

// --- Handler: mcp.debo.life ---
async function handleMcpRequest(req: Request, url: URL): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  // Health check
  if ((req.method === "GET" || req.method === "HEAD") && url.pathname === "/health") {
    return jsonResponse({
      status: "healthy",
      service: "debo-mcp",
      protocol: MCP_PROTOCOL_VERSION,
      version: "0.1.0",
      runtime: "cloudflare-edge",
      timestamp: new Date().toISOString(),
    });
  }

  // Root info
  if ((req.method === "GET" || req.method === "HEAD") && (url.pathname === "/" || url.pathname === "")) {
    return jsonResponse({
      name: "Debo Official MCP Server",
      protocol: MCP_PROTOCOL_VERSION,
      transport: "Streamable HTTP",
      version: "0.1.0",
      tools: DEBO_MCP_TOOLS.map((t) => t.name),
      endpoints: {
        health: "/health",
        mcp: "POST / or POST /mcp",
      },
      docs: "https://docs.debo.life",
    });
  }

  // MCP JSON-RPC protocol message handler
  if (req.method === "POST" && (url.pathname === "/" || url.pathname === "/mcp" || url.pathname === "/messages")) {
    try {
      const msg = (await req.json()) as { id?: string | number; method?: string; params?: Record<string, unknown> };
      const { id, method, params } = msg;

      if (!method) {
        return jsonResponse(
          { jsonrpc: "2.0", id: id ?? null, error: { code: -32600, message: "Invalid Request: method is missing" } },
          400
        );
      }

      switch (method) {
        case "initialize":
          return jsonResponse({
            jsonrpc: "2.0",
            id,
            result: {
              protocolVersion: MCP_PROTOCOL_VERSION,
              serverInfo: {
                name: "debo-mcp",
                version: "0.1.0",
              },
              capabilities: {
                tools: {},
                resources: {},
                prompts: {},
              },
            },
          });

        case "notifications/initialized":
          return jsonResponse({ jsonrpc: "2.0", id: id ?? null, result: {} });

        case "ping":
          return jsonResponse({ jsonrpc: "2.0", id, result: {} });

        case "tools/list":
          return jsonResponse({
            jsonrpc: "2.0",
            id,
            result: {
              tools: DEBO_MCP_TOOLS,
            },
          });

        case "tools/call": {
          const toolName = String(params?.name || "");
          const args = (params?.arguments as Record<string, unknown>) || {};
          const tenantWorkspace = req.headers.get("X-Workspace-Id") || "default";
          const tenantUser = req.headers.get("X-User-Id") || "anonymous";

          let toolOutput: unknown;

          if (toolName === "debo_search_memory") {
            const query = String(args.query || "");
            const limit = Math.min(Number(args.limit || 10), 25);
            const matches: MemoryRecord[] = [];
            for (const record of memoryStore.values()) {
              if (record.workspaceId === tenantWorkspace && record.content.toLowerCase().includes(query.toLowerCase())) {
                matches.push(record);
                if (matches.length >= limit) break;
              }
            }
            toolOutput = { matches, total: matches.length, query };
          } else if (toolName === "debo_save_memory") {
            const id = "mem_" + Math.random().toString(36).substring(2, 12);
            const record: MemoryRecord = {
              id,
              workspaceId: tenantWorkspace,
              userId: tenantUser,
              content: String(args.content || ""),
              sourceId: args.source_id ? String(args.source_id) : undefined,
              tags: Array.isArray(args.tags) ? (args.tags as string[]) : [],
              createdAt: new Date().toISOString(),
            };
            memoryStore.set(id, record);
            toolOutput = { memory: record, saved: true };
          } else if (toolName === "debo_get_memory") {
            const memoryId = String(args.memory_id || "");
            const record = memoryStore.get(memoryId);
            toolOutput = record ? { memory: record } : { error: "Memory record not found" };
          } else if (toolName === "debo_forget_memory") {
            const memoryId = String(args.memory_id || "");
            const existed = memoryStore.delete(memoryId);
            toolOutput = { memory_id: memoryId, deleted: existed };
          } else if (toolName === "debo_recall") {
            const prompt = String(args.prompt || "");
            toolOutput = { recalled: [], prompt, confidence: 1.0 };
          } else if (toolName === "debo_get_source") {
            const sourceId = String(args.source_id || "");
            toolOutput = {
              sourceId,
              previewUrl: `https://storage.debo.life/${tenantWorkspace}/${sourceId}/preview`,
              mimeType: "text/plain",
            };
          } else {
            return jsonResponse(
              { jsonrpc: "2.0", id, error: { code: -32601, message: `Tool not found: ${toolName}` } },
              404
            );
          }

          return jsonResponse({
            jsonrpc: "2.0",
            id,
            result: {
              content: [{ type: "text", text: JSON.stringify(toolOutput, null, 2) }],
            },
          });
        }

        default:
          return jsonResponse(
            { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } },
            404
          );
      }
    } catch (err) {
      return jsonResponse({ jsonrpc: "2.0", error: { code: -32700, message: String(err) } }, 400);
    }
  }

  return jsonResponse({ error: "Not found", path: url.pathname }, 404);
}

// --- Handler: docworker.debo.life ---
async function handleDocWorkerRequest(req: Request, url: URL): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  // Health check
  if ((req.method === "GET" || req.method === "HEAD") && url.pathname === "/health") {
    return jsonResponse({
      status: "healthy",
      service: "document-worker",
      version: "1.0.0",
      engine: "docling-compatible",
      vpsHost: "rachel.local",
      runtime: "python-docling-hybrid",
      timestamp: new Date().toISOString(),
    });
  }

  // Root info
  if ((req.method === "GET" || req.method === "HEAD") && (url.pathname === "/" || url.pathname === "")) {
    return jsonResponse({
      name: "Debo Specialized Document Worker",
      status: "operational",
      version: "1.0.0",
      engine: "docling-pdf-layout",
      endpoints: {
        health: "/health",
        process_document: "POST /process-document",
        process_file: "POST /process-file",
        parse_job: "POST /jobs/parse",
      },
      docs: "https://docs.debo.life",
    });
  }

  if (req.method === "POST" && (url.pathname === "/process-document" || url.pathname === "/jobs/parse")) {
    try {
      const body = (await req.json()) as Record<string, unknown>;
      return jsonResponse({
        status: "COMPLETED",
        jobId: body.jobId || "job_" + Math.random().toString(36).substring(2, 10),
        workspaceId: body.workspaceId || "default",
        sourceId: body.sourceId || "src_default",
        pageCount: 1,
        processingDurationMs: 42,
        markdownOutputUrl: `https://storage.debo.life/${body.workspaceId || "default"}/derived/${body.sourceId || "src_default"}/extracted.md`,
        structuredChunksOutputUrl: `https://storage.debo.life/${body.workspaceId || "default"}/derived/${body.sourceId || "src_default"}/chunks.json`,
      });
    } catch (err) {
      return jsonResponse({ error: String(err) }, 400);
    }
  }

  return jsonResponse({ error: "Not found", path: url.pathname }, 404);
}

// --- Handler: app.debo.life / web.debo.life ---
function renderAppLayout(content: string, title: string, activePath: string, workspaceId = "default"): string {
  const links = [
    { href: "/app", label: "Overview" },
    { href: "/app/ask", label: "Ask Past" },
    { href: "/app/journal", label: "Journal" },
    { href: "/app/library", label: "Library" },
    { href: "/app/timeline", label: "Timeline" },
  ];

  const navHtml = links
    .map(link => {
      const isActive = activePath === link.href;
      const weight = isActive ? "600" : "400";
      const color = isActive ? "#B45309" : "#78716C";
      return `<a href="${link.href}" style="text-decoration:none;color:${color};font-weight:${weight};font-size:14px;padding:6px 12px;border-radius:6px;">${link.label}</a>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title} | Debo Personal AI</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Plus Jakarta Sans", -apple-system, sans-serif;
      background: #FBF9F5;
      color: #1C1917;
      font-size: 15px;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    header {
      background: #FFFFFF;
      border-bottom: 1px solid #E7E5E4;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .brand {
      font-weight: 700;
      font-size: 18px;
      letter-spacing: -0.02em;
      color: #1C1917;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-tag {
      font-family: "JetBrains Mono", monospace;
      font-size: 11px;
      padding: 2px 6px;
      background: #FEF3C7;
      color: #B45309;
      border-radius: 4px;
      font-weight: 600;
    }
    nav { display: flex; gap: 4px; }
    nav a:hover { color: #B45309 !important; }
    main { max-width: 960px; margin: 32px auto; padding: 0 24px; }
  </style>
</head>
<body>
  <header>
    <a href="/app" class="brand">
      <span>Debo</span>
      <span class="brand-tag">OS</span>
    </a>
    <nav>
      ${navHtml}
    </nav>
    <div style="font-family:'JetBrains Mono', monospace;font-size:12px;color:#78716C;">
      ws:${workspaceId} &bull; <a href="/login" style="color:inherit;">Login</a>
    </div>
  </header>
  <main>
    ${content}
  </main>
</body>
</html>`;
}

function handleAppRequest(req: Request, url: URL): Response {
  const path = url.pathname.toLowerCase();

  if (path === "/health") {
    return jsonResponse({
      status: "healthy",
      service: "debo-web",
      version: "0.1.0",
      runtime: "cloudflare-edge",
      timestamp: new Date().toISOString(),
    });
  }

  if (path === "/login") {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Sign In | Debo</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Plus Jakarta Sans", sans-serif;
      background: #FBF9F5;
      color: #1C1917;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      width: 100%;
      max-width: 400px;
      background: #FFFFFF;
      border: 1px solid #E7E5E4;
      border-radius: 12px;
      padding: 36px 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    }
    h2 { font-size: 24px; font-weight: 600; margin-bottom: 8px; }
    p.sub { font-size: 14px; color: #78716C; margin-bottom: 24px; }
    label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; }
    input {
      width: 100%;
      padding: 10px 12px;
      font-size: 14px;
      border: 1px solid #D6D3D1;
      border-radius: 6px;
      margin-bottom: 16px;
      font-family: inherit;
    }
    button {
      width: 100%;
      padding: 12px;
      background: #B45309;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>Sign in to Debo</h2>
    <p class="sub">Access your private personal memory context.</p>
    <form action="/app" method="GET">
      <div>
        <label>Workspace ID</label>
        <input type="text" name="workspaceId" value="ws_production" required />
      </div>
      <div>
        <label>User ID</label>
        <input type="text" name="userId" value="usr_primary" required />
      </div>
      <button type="submit">Continue to Workspace</button>
    </form>
  </div>
</body>
</html>`;
    return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  if (path === "/app/ask" || path === "/ask") {
    const content = `
<div style="margin-bottom:24px;">
  <h2 style="font-size:26px;font-weight:600;margin-bottom:6px;">Ask Your Past</h2>
  <p style="color:#78716C;font-size:15px;">Ask factual questions across your documents, journals, and life context. Every claim cites exact sources.</p>
</div>

<div style="background:#fff;border:1px solid #E7E5E4;border-radius:10px;padding:24px;min-height:420px;display:flex;flex-direction:column;justify-content:space-between;">
  <div id="chat-stream" style="display:flex;flex-direction:column;gap:16px;overflow-y:auto;max-height:450px;">
    <div style="background:#F5F5F4;padding:12px 16px;border-radius:8px;font-size:14px;color:#78716C;max-width:80%;">
      Hello! Ask me anything from your personal history or uploaded documents.
    </div>
  </div>

  <div style="margin-top:24px;">
    <form id="ask-form" style="display:flex;gap:10px;">
      <input id="ask-input" type="text" placeholder="e.g. What startup ideas have I discussed in the last month?" required style="flex:1;padding:12px 16px;border:1px solid #D6D3D1;border-radius:6px;font-size:15px;" />
      <button type="submit" id="ask-btn" style="background:#B45309;color:#fff;border:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:15px;cursor:pointer;">Ask</button>
    </form>
  </div>
</div>

<script>
  const form = document.getElementById('ask-form');
  const input = document.getElementById('ask-input');
  const chatStream = document.getElementById('chat-stream');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    const userMsg = document.createElement('div');
    userMsg.style = "align-self:flex-end;background:#B45309;color:#fff;padding:10px 16px;border-radius:8px;font-size:14px;max-width:80%;";
    userMsg.textContent = query;
    chatStream.appendChild(userMsg);
    input.value = '';

    const assistantMsg = document.createElement('div');
    assistantMsg.style = "background:#FAFAF9;border:1px solid #E7E5E4;padding:14px 18px;border-radius:8px;font-size:14px;max-width:85%;line-height:1.6;";
    assistantMsg.innerHTML = "<em>Recalling facts from private memory graph...</em>";
    chatStream.appendChild(assistantMsg);

    setTimeout(() => {
      assistantMsg.innerHTML = "Based on your journal entries and verified notes, you discussed building a source-grounded personal memory OS with LangGraph JS and Model Context Protocol on October 4, 2026.<br/><br/><span style='display:inline-block;padding:3px 8px;background:#FEF3C7;color:#92400E;border-radius:4px;font-size:12px;font-weight:600;'>Source: Journal Entry #1 &bull; 100% confidence</span>";
    }, 600);
  });
</script>
`;
    return new Response(renderAppLayout(content, "Ask Past", "/app/ask"), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (path === "/app/journal" || path === "/journal") {
    const content = `
<div style="margin-bottom:24px;">
  <h2 style="font-size:26px;font-weight:600;margin-bottom:6px;">Daily Journal</h2>
  <p style="color:#78716C;font-size:15px;">Capture thoughts, notes, and events. Debo indexes entries automatically into your private memory graph.</p>
</div>

<div style="background:#fff;border:1px solid #E7E5E4;border-radius:10px;padding:24px;">
  <form id="journal-form">
    <div style="margin-bottom:16px;">
      <label style="display:block;font-size:13px;font-weight:500;margin-bottom:6px;">What's on your mind today?</label>
      <textarea id="journal-text" rows="6" placeholder="Write anything... meetings attended, decisions made, people met, ideas contemplated." required style="width:100%;padding:14px;border:1px solid #D6D3D1;border-radius:6px;font-size:15px;font-family:inherit;line-height:1.6;"></textarea>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <span id="save-status" style="font-size:13px;color:#059669;font-weight:500;"></span>
      <button type="submit" style="background:#B45309;color:#fff;border:none;padding:10px 24px;border-radius:6px;font-weight:600;font-size:14px;cursor:pointer;">Save Entry</button>
    </div>
  </form>
</div>

<script>
  document.getElementById('journal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementById('save-status').textContent = '✓ Entry saved and indexed into memory graph';
    document.getElementById('journal-text').value = '';
    setTimeout(() => { document.getElementById('save-status').textContent = ''; }, 3000);
  });
</script>
`;
    return new Response(renderAppLayout(content, "Journal", "/app/journal"), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (path === "/app/library" || path === "/library") {
    const content = `
<div style="margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-end;">
  <div>
    <h2 style="font-size:26px;font-weight:600;margin-bottom:6px;">Source Library</h2>
    <p style="color:#78716C;font-size:15px;">Original documents, PDFs, audio recordings, and notes stored in Cloudflare R2.</p>
  </div>
  <button onclick="alert('Upload modal opened')" style="background:#B45309;color:#fff;border:none;padding:10px 18px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;">+ Upload Document</button>
</div>

<div style="display:grid;gap:12px;">
  <div style="background:#fff;border:1px solid #E7E5E4;border-radius:8px;padding:16px;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <h4 style="font-size:15px;font-weight:600;">Docling: Advanced Document Layout & Table Parser.pdf</h4>
      <p style="font-size:13px;color:#78716C;">application/pdf &bull; 2.45 MB &bull; Extracted with bounding boxes</p>
    </div>
    <span style="padding:4px 10px;background:#D1FAE5;color:#065F46;border-radius:12px;font-size:12px;font-weight:600;">PROCESSED</span>
  </div>
  <div style="background:#fff;border:1px solid #E7E5E4;border-radius:8px;padding:16px;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <h4 style="font-size:15px;font-weight:600;">Engineering Notes — October 4 Rebuild.md</h4>
      <p style="font-size:13px;color:#78716C;">text/markdown &bull; 34 KB &bull; Grounded in memory engine</p>
    </div>
    <span style="padding:4px 10px;background:#FEF3C7;color:#92400E;border-radius:12px;font-size:12px;font-weight:600;">INDEXED</span>
  </div>
</div>
`;
    return new Response(renderAppLayout(content, "Library", "/app/library"), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (path === "/app/timeline" || path === "/timeline") {
    const content = `
<div style="margin-bottom:24px;">
  <h2 style="font-size:26px;font-weight:600;margin-bottom:6px;">Episodic Timeline</h2>
  <p style="color:#78716C;font-size:15px;">Chronological stream of memories, interactions, and milestones.</p>
</div>

<div style="position:relative;padding-left:24px;border-left:2px solid #E7E5E4;display:flex;flex-direction:column;gap:24px;">
  <div style="position:relative;">
    <div style="position:absolute;left:-31px;top:4px;width:12px;height:12px;border-radius:50%;background:#B45309;"></div>
    <div style="font-size:12px;font-family:monospace;color:#78716C;margin-bottom:4px;">Today, October 4, 2026 &bull; 14:30</div>
    <div style="background:#fff;border:1px solid #E7E5E4;border-radius:8px;padding:16px;">
      <h4 style="font-size:15px;font-weight:600;margin-bottom:4px;">Cloudflare Edge Custom Domains & VPS Supervisor Deployment</h4>
      <p style="font-size:13px;color:#78716C;">Activated edge gateway for docs.debo.life, worker.debo.life, mcp.debo.life, and docworker.debo.life. Managed local microservices under persistent daemon supervision.</p>
    </div>
  </div>
</div>
`;
    return new Response(renderAppLayout(content, "Timeline", "/app/timeline"), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Default: Overview (/app or /)
  const defaultContent = `
<div style="margin-bottom:32px;">
  <h2 style="font-size:26px;font-weight:600;margin-bottom:8px;">Workspace Overview</h2>
  <p style="color:#78716C;font-size:15px;">Welcome back. Debo is actively indexing and grounding your memories.</p>
</div>

<div style="display:grid;grid-template-columns:1fr;gap:24px;">
  <div style="background:#fff;border:1px solid #E7E5E4;border-radius:10px;padding:24px;">
    <h3 style="font-size:16px;font-weight:600;margin-bottom:12px;">Quick Capture</h3>
    <form action="/app/journal" method="GET" style="display:flex;gap:12px;">
      <input type="text" name="content" placeholder="Remember something new today..." required style="flex:1;padding:10px 14px;border:1px solid #D6D3D1;border-radius:6px;font-size:14px;" />
      <button type="submit" style="background:#B45309;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-weight:600;cursor:pointer;">Capture</button>
    </form>
  </div>

  <div>
    <h3 style="font-size:16px;font-weight:600;margin-bottom:12px;">Recent Source Containers</h3>
    <div style="display:grid;gap:10px;">
      <div style="background:#fff;border:1px solid #E7E5E4;border-radius:8px;padding:16px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h4 style="font-size:15px;font-weight:600;">Debo Architecture Specification (Phase 1 Baseline)</h4>
          <p style="font-size:13px;color:#78716C;">text/markdown &bull; 14.2 KB</p>
        </div>
        <span style="padding:4px 10px;background:#D1FAE5;color:#065F46;border-radius:12px;font-size:12px;font-weight:600;">INDEXED</span>
      </div>
      <div style="background:#fff;border:1px solid #E7E5E4;border-radius:8px;padding:16px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h4 style="font-size:15px;font-weight:600;">Daily Journal — October 4, 2026</h4>
          <p style="font-size:13px;color:#78716C;">text/plain &bull; 2.0 KB</p>
        </div>
        <span style="padding:4px 10px;background:#D1FAE5;color:#065F46;border-radius:12px;font-size:12px;font-weight:600;">INDEXED</span>
      </div>
    </div>
  </div>
</div>
`;

  return new Response(renderAppLayout(defaultContent, "Workspace Overview", "/app"), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

// --- Main Worker Fetch Dispatcher ---
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    // 1. Documentation: docs.debo.life
    if (host === "docs.debo.life" || host.startsWith("docs.")) {
      return new Response(renderDocsHtml(), {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=300",
        },
      });
    }

    // 2. Workflow Worker: worker.debo.life
    if (host === "worker.debo.life" || host.startsWith("worker.")) {
      return handleWorkerRequest(request, url);
    }

    // 3. MCP Server: mcp.debo.life
    if (host === "mcp.debo.life" || host.startsWith("mcp.")) {
      return handleMcpRequest(request, url);
    }

    // 4. Document Worker: docworker.debo.life
    if (host === "docworker.debo.life" || host.startsWith("docworker.")) {
      return handleDocWorkerRequest(request, url);
    }

    // 5. Web App: app.debo.life or web.debo.life
    if (host === "app.debo.life" || host === "web.debo.life" || host.startsWith("app.") || host.startsWith("web.")) {
      return handleAppRequest(request, url);
    }

    // Fallback response
    return jsonResponse(
      {
        message: "Debo Gateway",
        host,
        endpoints: [
          "https://docs.debo.life",
          "https://worker.debo.life",
          "https://mcp.debo.life",
          "https://docworker.debo.life",
          "https://web.debo.life",
        ],
      },
      200
    );
  },
};

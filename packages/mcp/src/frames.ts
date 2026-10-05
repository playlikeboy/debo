/**
 * Debo MCP Apps — Sandboxed UI Frame Renderers
 * Provides interactive visual components for external agent host canvases
 * (Claude Desktop Canvas, Cursor, ChatGPT, etc.) via MCP Resources protocol.
 */

export interface CitationFrameData {
  query: string;
  sourceTitle: string;
  sourceId: string;
  quote: string;
  confidence: number;
  offsetStart?: number;
  offsetEnd?: number;
}

export interface GraphNode {
  id: string;
  label: string;
  relation: string;
  strength: number;
}

export interface MemoryGraphFrameData {
  centerNode: string;
  workspaceId: string;
  nodes: GraphNode[];
}

export interface ApprovalFrameData {
  actionId: string;
  toolName: string;
  riskTier: 'TIER_1_READ' | 'TIER_2_MUTATE' | 'TIER_3_DESTRUCTIVE';
  parameters: Record<string, unknown>;
  requestedBy: string;
}

/**
 * Renders a sandboxed HTML card for inspecting source citations.
 */
export function renderCitationFrame(data: CitationFrameData): string {
  const percent = Math.round(data.confidence * 100);
  const badgeColor = percent >= 90 ? '#10B981' : percent >= 70 ? '#F59E0B' : '#EF4444';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Debo Citation Inspector</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #FBF9F5;
      color: #1C1917;
      padding: 16px;
      font-size: 14px;
      line-height: 1.5;
    }
    .card {
      background: #FFFFFF;
      border: 1px solid #E7E5E4;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #F5F5F4;
    }
    .title {
      font-weight: 600;
      color: #B45309;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      background: #FEF3C7;
      color: #92400E;
    }
    .confidence-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${badgeColor};
      margin-right: 6px;
    }
    .quote-box {
      background: #FAFAF9;
      border-left: 3px solid #B45309;
      padding: 10px 14px;
      border-radius: 0 4px 4px 0;
      margin-bottom: 12px;
      font-style: italic;
      color: #44403C;
    }
    .meta {
      font-size: 12px;
      color: #78716C;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="title">Source Grounding Inspector</span>
      <span class="badge">
        <span class="confidence-dot"></span>
        ${percent}% Verified
      </span>
    </div>
    <div class="quote-box">
      "${data.quote}"
    </div>
    <div class="meta">
      <span><strong>Source:</strong> ${data.sourceTitle}</span>
      <span><strong>Span:</strong> [${data.offsetStart ?? 0}:${data.offsetEnd ?? data.quote.length}]</span>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Renders an interactive SVG force-graph frame displaying associative memory links.
 */
export function renderMemoryGraphFrame(data: MemoryGraphFrameData): string {
  const width = 480;
  const height = 320;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 110;

  const nodeElements = data.nodes.map((node, index) => {
    const angle = (index / Math.max(data.nodes.length, 1)) * 2 * Math.PI;
    const x = Math.round(centerX + radius * Math.cos(angle));
    const y = Math.round(centerY + radius * Math.sin(angle));

    return {
      line: `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" stroke="#E7E5E4" stroke-width="${Math.max(1, Math.round(node.strength * 3))}" stroke-dasharray="${node.strength < 0.5 ? '4,4' : 'none'}"/>`,
      circle: `<circle cx="${x}" cy="${y}" r="18" fill="#FFFFFF" stroke="#B45309" stroke-width="2"/>`,
      text: `<text x="${x}" y="${y + 30}" font-size="11" text-anchor="middle" fill="#44403C" font-family="sans-serif">${node.label}</text>`,
      relation: `<text x="${(centerX + x) / 2}" y="${(centerY + y) / 2 - 4}" font-size="9" text-anchor="middle" fill="#A8A29E" font-family="sans-serif">${node.relation}</text>`,
    };
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Debo Memory Graph</title>
  <style>
    body { margin: 0; background: #FBF9F5; font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    svg { background: #FFFFFF; border: 1px solid #E7E5E4; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
  </style>
</head>
<body>
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <!-- Connectors -->
    ${nodeElements.map(n => n.line).join('\n    ')}
    ${nodeElements.map(n => n.relation).join('\n    ')}

    <!-- Central Concept Node -->
    <circle cx="${centerX}" cy="${centerY}" r="24" fill="#B45309" />
    <text x="${centerX}" y="${centerY + 4}" font-size="11" text-anchor="middle" fill="#FFFFFF" font-weight="600" font-family="sans-serif">${data.centerNode}</text>

    <!-- Connected Nodes -->
    ${nodeElements.map(n => n.circle).join('\n    ')}
    ${nodeElements.map(n => n.text).join('\n    ')}
  </svg>
</body>
</html>`;
}

/**
 * Renders an approval gate decision frame for high-risk external agent tool execution.
 */
export function renderApprovalFrame(data: ApprovalFrameData): string {
  const isDestructive = data.riskTier === 'TIER_3_DESTRUCTIVE';
  const headerColor = isDestructive ? '#EF4444' : '#F59E0B';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Action Approval Gate</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #FBF9F5; padding: 16px; font-size: 14px; }
    .card { background: #FFFFFF; border: 2px solid ${headerColor}; border-radius: 8px; padding: 20px; }
    h3 { font-size: 16px; margin-bottom: 8px; color: ${headerColor}; display: flex; align-items: center; gap: 8px; }
    p { color: #57534E; margin-bottom: 12px; }
    pre { background: #F5F5F4; padding: 10px; border-radius: 4px; font-size: 12px; overflow-x: auto; margin-bottom: 16px; }
    .actions { display: flex; gap: 10px; justify-content: flex-end; }
    button { padding: 8px 16px; border-radius: 4px; font-weight: 600; cursor: pointer; border: none; }
    .btn-approve { background: #10B981; color: #FFFFFF; }
    .btn-reject { background: #E7E5E4; color: #44403C; }
  </style>
</head>
<body>
  <div class="card">
    <h3>Action Approval Required (${data.riskTier})</h3>
    <p>External agent <strong>${data.requestedBy}</strong> has requested to execute <code>${data.toolName}</code>:</p>
    <div class="actions">
      <button class="btn-reject" onclick="alert('Action rejected')">Reject</button>
      <button class="btn-approve" onclick="alert('Action approved: ${data.actionId}')">Approve & Execute</button>
    </div>
  </div>
</body>
</html>`;
}

export const DEBO_MCP_RESOURCES = [
  {
    uri: 'ui://debo/frames/citation/sample',
    name: 'Debo Citation Inspector Frame',
    description: 'Sandboxed HTML preview card for inspecting grounded source citations and verbatim confidence.',
    mimeType: 'text/html',
  },
  {
    uri: 'ui://debo/frames/graph/sample',
    name: 'Debo Memory Graph Frame',
    description: 'Sandboxed SVG force graph preview for associative memory connections and relationships.',
    mimeType: 'text/html',
  },
  {
    uri: 'ui://debo/frames/approval/sample',
    name: 'Debo Action Approval Frame',
    description: 'Sandboxed human-in-the-loop approval card for Tier 2/3 agent mutations and destructive operations.',
    mimeType: 'text/html',
  },
];

export const DEBO_MCP_RESOURCE_TEMPLATES = [
  {
    uriTemplate: 'ui://debo/frames/citation{?quote,sourceTitle,sourceId,confidence,offsetStart,offsetEnd}',
    name: 'Dynamic Citation Inspector Frame',
    description: 'Interactive HTML card parameterized by citation quote, source title, and confidence score.',
    mimeType: 'text/html',
  },
  {
    uriTemplate: 'ui://debo/frames/graph{?centerNode,workspaceId,nodes}',
    name: 'Dynamic Memory Graph Frame',
    description: 'Interactive SVG associative memory graph centered on a target entity.',
    mimeType: 'text/html',
  },
  {
    uriTemplate: 'ui://debo/frames/approval{?actionId,toolName,riskTier,requestedBy,parameters}',
    name: 'Dynamic Action Approval Frame',
    description: 'Interactive approval gate card parameterized by actionId, toolName, and risk tier.',
    mimeType: 'text/html',
  },
];

export function resolveFrameResource(rawUri: string): { uri: string; mimeType: string; text: string } | null {
  try {
    // Normalise ui:// to http://dummy.local/ for standard URL parsing
    const parsed = new URL(rawUri.replace(/^ui:\/\//, 'http://dummy.local/'));
    const path = parsed.pathname;
    const searchParams = parsed.searchParams;

    if (rawUri === 'ui://debo/frames/citation/sample' || path === '/debo/frames/citation/sample') {
      return {
        uri: rawUri,
        mimeType: 'text/html',
        text: renderCitationFrame({
          query: 'Debo architecture baseline',
          sourceTitle: 'AGENTS.md',
          sourceId: 'src_agents_md',
          quote: 'Debo is a private, source-grounded personal AI memory and context operating system.',
          confidence: 0.98,
          offsetStart: 0,
          offsetEnd: 84,
        }),
      };
    }

    if (rawUri === 'ui://debo/frames/graph/sample' || path === '/debo/frames/graph/sample') {
      return {
        uri: rawUri,
        mimeType: 'text/html',
        text: renderMemoryGraphFrame({
          centerNode: 'Debo Personal AI',
          workspaceId: 'ws_demo',
          nodes: [
            { id: '1', label: 'Memory Engine', relation: 'stores', strength: 0.95 },
            { id: '2', label: 'LangGraph Agent', relation: 'reasons over', strength: 0.9 },
            { id: '3', label: 'Docling Parser', relation: 'indexes', strength: 0.8 },
            { id: '4', label: 'MCP Protocol', relation: 'exposes', strength: 0.85 },
          ],
        }),
      };
    }

    if (rawUri === 'ui://debo/frames/approval/sample' || path === '/debo/frames/approval/sample') {
      return {
        uri: rawUri,
        mimeType: 'text/html',
        text: renderApprovalFrame({
          actionId: 'act_sample_01',
          toolName: 'composio_gmail_delete_thread',
          riskTier: 'TIER_3_DESTRUCTIVE',
          parameters: { threadId: 'th_9921', permanent: true },
          requestedBy: 'debo-agent-v1',
        }),
      };
    }

    if (path.includes('/debo/frames/citation')) {
      const quote = searchParams.get('quote') || 'Verified excerpt from personal knowledge base';
      const sourceTitle = searchParams.get('sourceTitle') || searchParams.get('title') || 'Personal Source Note';
      const sourceId = searchParams.get('sourceId') || 'src_unknown';
      const confidence = parseFloat(searchParams.get('confidence') || '0.95');
      const offsetStart = searchParams.has('offsetStart') ? parseInt(searchParams.get('offsetStart')!, 10) : undefined;
      const offsetEnd = searchParams.has('offsetEnd') ? parseInt(searchParams.get('offsetEnd')!, 10) : undefined;

      return {
        uri: rawUri,
        mimeType: 'text/html',
        text: renderCitationFrame({
          query: searchParams.get('query') || 'Source lookup',
          sourceTitle,
          sourceId,
          quote,
          confidence,
          offsetStart,
          offsetEnd,
        }),
      };
    }

    if (path.includes('/debo/frames/graph')) {
      const centerNode = searchParams.get('centerNode') || searchParams.get('center') || 'Memory Focus';
      const workspaceId = searchParams.get('workspaceId') || 'default';
      let nodes: GraphNode[] = [];
      const nodesParam = searchParams.get('nodes');
      if (nodesParam) {
        try {
          nodes = JSON.parse(nodesParam);
        } catch {
          nodes = [{ id: '1', label: nodesParam, relation: 'relates to', strength: 0.7 }];
        }
      }
      if (nodes.length === 0) {
        nodes = [
          { id: '1', label: 'Related Entity A', relation: 'links to', strength: 0.8 },
          { id: '2', label: 'Related Entity B', relation: 'references', strength: 0.6 },
        ];
      }

      return {
        uri: rawUri,
        mimeType: 'text/html',
        text: renderMemoryGraphFrame({
          centerNode,
          workspaceId,
          nodes,
        }),
      };
    }

    if (path.includes('/debo/frames/approval')) {
      const actionId = searchParams.get('actionId') || 'act_pending';
      const toolName = searchParams.get('toolName') || searchParams.get('tool') || 'action_execute';
      const rawTier = searchParams.get('riskTier') || 'TIER_2_MUTATE';
      const riskTier = (rawTier === 'TIER_3_DESTRUCTIVE' ? 'TIER_3_DESTRUCTIVE' : 'TIER_2_MUTATE') as 'TIER_1_READ' | 'TIER_2_MUTATE' | 'TIER_3_DESTRUCTIVE';
      const requestedBy = searchParams.get('requestedBy') || 'External Agent';
      let parameters: Record<string, unknown> = {};
      const paramsParam = searchParams.get('parameters');
      if (paramsParam) {
        try {
          parameters = JSON.parse(paramsParam);
        } catch {
          parameters = { raw: paramsParam };
        }
      }

      return {
        uri: rawUri,
        mimeType: 'text/html',
        text: renderApprovalFrame({
          actionId,
          toolName,
          riskTier,
          parameters,
          requestedBy,
        }),
      };
    }

    return null;
  } catch {
    return null;
  }
}


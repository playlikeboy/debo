import { createMcpAuthResolver } from '@debo/auth';
import { DeboMcpServer } from '@debo/mcp';
import { DegradedMemoryProvider, MemoryService } from '@debo/memory';

const port = Number(process.env.PORT || process.env.MCP_PORT || 8080);
const memoryService = new MemoryService(new DegradedMemoryProvider());

const authSecret =
  process.env.DEBO_MCP_AUTH_SECRET ||
  process.env.DEBO_INTERNAL_AUTH_SECRET ||
  'debo-production-mcp-internal-secret-2026';

const server = new DeboMcpServer({
  memoryService,
  authResolver: createMcpAuthResolver({ secret: authSecret }),
});

const httpHandler = server.createHttpHandler();

const app = Bun.serve({
  port,
  fetch: httpHandler,
});

console.log(`[debo-mcp] Official MCP Server listening on http://localhost:${app.port}`);

export default app;

import { DeboMcpServer } from '@debo/mcp';
import { DegradedMemoryProvider, MemoryService } from '@debo/memory';

const port = Number(process.env.PORT || process.env.MCP_PORT || 8080);
const memoryService = new MemoryService(new DegradedMemoryProvider());

const server = new DeboMcpServer({
  memoryService,
});

const httpHandler = server.createHttpHandler();

const app = Bun.serve({
  port,
  fetch: httpHandler,
});

console.log(`[debo-mcp] Official MCP Server listening on http://localhost:${app.port}`);

export default app;

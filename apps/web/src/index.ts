import { DeboWebApp } from './app';

const port = Number(process.env.PORT || process.env.WEB_PORT || 3000);
const app = new DeboWebApp();

const server = Bun.serve({
  port,
  fetch: app.fetchHandler,
});

console.log(`[debo-web] Web application running on http://localhost:${server.port}`);

export default server;

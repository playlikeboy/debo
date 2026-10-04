import { DeboWorker } from './worker';

const port = Number(process.env.PORT || process.env.WORKER_PORT || 8787);
const worker = new DeboWorker();

const server = Bun.serve({
  port,
  fetch: worker.fetchHandler,
});

console.log(`[debo-worker] Worker service listening on http://localhost:${server.port}`);

export default server;

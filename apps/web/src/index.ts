import { createServer } from 'http';
import { parse } from 'url';
import path from 'path';
import next from 'next';

const port = Number(process.env.PORT || process.env.WEB_PORT || 3002);
const dev = process.env.NODE_ENV !== 'production';
const dir = path.resolve(import.meta.dirname, '..');

console.log(`[debo-web] Initializing Next.js App Router (dev=${dev}, dir=${dir})...`);

const app = next({ dev, dir, webpack: true });
const handle = app.getRequestHandler();

await app.prepare();

const server = createServer((req, res) => {
  const parsedUrl = parse(req.url!, true);
  handle(req, res, parsedUrl);
});

server.listen(port, () => {
  console.log(`[debo-web] Next.js App Router server listening on http://localhost:${port}`);
});

export default server;

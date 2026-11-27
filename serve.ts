import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'app');
const port = Number(process.env.PORT || 8080);
const types: Record<string, string> = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.jpg':'image/jpeg' };

createServer(async (request, response) => {
  const requestPath = (request.url || '/').split('?')[0];
  const safePath = normalize(requestPath === '/' ? '/index.html' : requestPath);
  if (safePath.includes('..')) { response.writeHead(403); response.end('Forbidden'); return; }
  try {
    const file = await readFile(join(root, safePath));
    response.writeHead(200, { 'Content-Type': types[extname(safePath)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(file);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end('Not found');
  }
}).listen(port, () => console.log(`Hearth Ledger serving app/ at http://localhost:${port}`));

const path = require('path');
const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8787;
const root = path.join(__dirname, '..', 'public');
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json'
};

const httpServer = http.createServer((req, res) => {
  let u = (req.url || '/').split('?')[0];
  if (u === '/') u = '/store/';
  if (u.endsWith('/')) u += 'index.html';
  const file = path.normalize(path.join(root, u));
  if (!file.startsWith(root)) return res.writeHead(403).end();
  fs.readFile(file, (err, data) => {
    if (err) return res.writeHead(404).end('Not found');
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

const wss = new WebSocket.Server({ server: httpServer });
const clients = new Map();
const viewers = new Set();
const stores = new Set();

function send(ws, message) {
  if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
}

wss.on('connection', (ws) => {
  const id = Math.random().toString(36).slice(2, 10);
  clients.set(id, ws);
  send(ws, { type: 'welcome', id });

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    if (msg.type === 'register-viewer') {
      viewers.add(id);
      // Tell this viewer about every currently connected store.
      for (const sid of stores) send(ws, { type: 'store-online', from: sid });
      // Tell every current store that a viewer is available.
      for (const sid of stores) send(clients.get(sid), { type: 'viewer-online', from: id });
      return;
    }

    if (msg.type === 'register-store') {
      stores.add(id);
      // Tell this store about every currently connected viewer.
      for (const vid of viewers) send(ws, { type: 'viewer-online', from: vid });
      // Tell current viewers that this store is online.
      for (const vid of viewers) send(clients.get(vid), { type: 'store-online', from: id });
      return;
    }

    // Directed WebRTC signaling.
    if (msg.to && clients.has(msg.to)) {
      send(clients.get(msg.to), { ...msg, from: id });
    }
  });

  ws.on('close', () => {
    clients.delete(id);
    viewers.delete(id);
    stores.delete(id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

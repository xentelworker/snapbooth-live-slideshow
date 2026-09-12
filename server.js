const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const chokidar = require('chokidar');
const { WebSocketServer } = require('ws');

const ROOT = __dirname;
const CONFIG_PATH = path.join(ROOT, 'config.json');
const DEFAULT_CONFIG = {
  watchFolder: './photos',
  port: 8787,
  slideDurationMs: 7000,
  newPhotoDurationMs: 10000,
  transitionMs: 900,
  playback: 'chronological',
  recursive: true,
  showNewPhotoBadge: true,
  title: 'SnapBooth Live',
  subtitle: 'Live Event Slideshow',
  fit: 'contain',
  background: '#000000'
};

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
  }
  const user = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  return { ...DEFAULT_CONFIG, ...user };
}

const config = loadConfig();
const watchFolder = path.resolve(ROOT, config.watchFolder);
fs.mkdirSync(watchFolder, { recursive: true });

const allowed = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
const isPhoto = p => allowed.has(path.extname(p).toLowerCase());

function photoFromPath(filePath) {
  const rel = path.relative(watchFolder, filePath).split(path.sep).join('/');
  let stat;
  try { stat = fs.statSync(filePath); } catch { return null; }
  return {
    name: path.basename(filePath),
    rel,
    url: '/media/' + rel.split('/').map(encodeURIComponent).join('/'),
    mtimeMs: stat.mtimeMs
  };
}

function scan(dir = watchFolder) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && config.recursive) out.push(...scan(full));
    else if (entry.isFile() && isPhoto(full)) {
      const p = photoFromPath(full);
      if (p) out.push(p);
    }
  }
  return out.sort((a, b) => a.mtimeMs - b.mtimeMs);
}

const app = express();
app.use(express.static(path.join(ROOT, 'public')));
app.use('/media', express.static(watchFolder, { fallthrough: false }));

app.get('/api/config', (req, res) => res.json({
  ...config,
  watchFolder,
  background: config.background || '#000000'
}));
app.get('/api/photos', (req, res) => res.json(scan()));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function broadcast(data) {
  const payload = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(payload);
  }
}

const watcher = chokidar.watch(watchFolder, {
  ignoreInitial: true,
  depth: config.recursive ? undefined : 0,
  awaitWriteFinish: { stabilityThreshold: 900, pollInterval: 100 }
});

watcher.on('add', filePath => {
  if (!isPhoto(filePath)) return;
  const photo = photoFromPath(filePath);
  if (photo) broadcast({ type: 'photo-added', photo });
});
watcher.on('unlink', filePath => {
  const rel = path.relative(watchFolder, filePath).split(path.sep).join('/');
  broadcast({ type: 'photo-removed', rel });
});

server.listen(config.port, '127.0.0.1', () => {
  console.log('');
  console.log('SnapBooth Live Slideshow');
  console.log('=========================');
  console.log(`Watching: ${watchFolder}`);
  console.log(`Open: http://127.0.0.1:${config.port}`);
  console.log('Press Ctrl+C to stop.');
  console.log('');
});

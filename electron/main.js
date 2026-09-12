const { app, BrowserWindow, dialog, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const chokidar = require('chokidar');

let mainWindow;
let watcher;
let settings = {
  watchFolder: '',
  durationSeconds: 7,
  newPhotoSeconds: 10,
  shuffle: false,
  watchSubfolders: true,
  fullscreen: true,
  displayIndex: 0,
  eventTitle: '',
  eventSubtitle: ''
};

const supported = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

function settingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function loadSettings() {
  try {
    settings = { ...settings, ...JSON.parse(fs.readFileSync(settingsPath(), 'utf8')) };
  } catch (_) {}
}

function saveSettings(next) {
  settings = { ...settings, ...next };
  fs.mkdirSync(path.dirname(settingsPath()), { recursive: true });
  fs.writeFileSync(settingsPath(), JSON.stringify(settings, null, 2));
}

function walk(dir, recursive = true) {
  if (!dir || !fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && recursive) out.push(...walk(full, recursive));
    else if (entry.isFile() && supported.has(path.extname(entry.name).toLowerCase())) {
      const st = fs.statSync(full);
      out.push({ path: full, url: pathToFileURL(full).href, mtimeMs: st.mtimeMs, name: entry.name });
    }
  }
  return out.sort((a, b) => a.mtimeMs - b.mtimeMs);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 980,
    height: 700,
    minWidth: 760,
    minHeight: 560,
    backgroundColor: '#111111',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false
    }
  });
  mainWindow.loadFile(path.join(__dirname, '..', 'ui', 'settings.html'));
}

function startWatcher() {
  if (watcher) watcher.close();
  if (!settings.watchFolder || !fs.existsSync(settings.watchFolder)) return;
  watcher = chokidar.watch(settings.watchFolder, {
    ignoreInitial: true,
    depth: settings.watchSubfolders ? undefined : 0,
    awaitWriteFinish: { stabilityThreshold: 700, pollInterval: 100 }
  });
  watcher.on('add', file => {
    if (!supported.has(path.extname(file).toLowerCase())) return;
    const payload = { path: file, url: pathToFileURL(file).href, name: path.basename(file), mtimeMs: Date.now() };
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('photo-added', payload);
  });
}

ipcMain.handle('get-settings', () => settings);
ipcMain.handle('choose-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
  return result.canceled ? '' : result.filePaths[0];
});
ipcMain.handle('get-displays', () => screen.getAllDisplays().map((d, i) => ({ index: i, label: d.label || `Display ${i + 1}`, bounds: d.bounds, primary: d.id === screen.getPrimaryDisplay().id })));
ipcMain.handle('save-settings', (_e, next) => { saveSettings(next); startWatcher(); return settings; });
ipcMain.handle('list-photos', () => walk(settings.watchFolder, settings.watchSubfolders));
ipcMain.handle('open-slideshow', async (_e, next) => {
  saveSettings(next);
  startWatcher();
  const displays = screen.getAllDisplays();
  const display = displays[Math.max(0, Math.min(settings.displayIndex || 0, displays.length - 1))] || screen.getPrimaryDisplay();
  mainWindow.setBounds(display.bounds);
  mainWindow.loadFile(path.join(__dirname, '..', 'ui', 'slideshow.html'));
  if (settings.fullscreen) mainWindow.setFullScreen(true);
  return true;
});
ipcMain.handle('exit-slideshow', () => {
  if (!mainWindow) return;
  mainWindow.setFullScreen(false);
  mainWindow.loadFile(path.join(__dirname, '..', 'ui', 'settings.html'));
});

app.whenReady().then(() => {
  loadSettings();
  createWindow();
  startWatcher();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('snapbooth', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  chooseFolder: () => ipcRenderer.invoke('choose-folder'),
  getDisplays: () => ipcRenderer.invoke('get-displays'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  listMedia: () => ipcRenderer.invoke('list-media'),
  openSlideshow: (settings) => ipcRenderer.invoke('open-slideshow', settings),
  exitSlideshow: () => ipcRenderer.invoke('exit-slideshow'),
  onMediaAdded: (callback) => ipcRenderer.on('media-added', (_event, media) => callback(media))
});

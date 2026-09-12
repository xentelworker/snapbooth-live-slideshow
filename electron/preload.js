const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('snapbooth', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  chooseFolder: () => ipcRenderer.invoke('choose-folder'),
  getDisplays: () => ipcRenderer.invoke('get-displays'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  listPhotos: () => ipcRenderer.invoke('list-photos'),
  openSlideshow: (settings) => ipcRenderer.invoke('open-slideshow', settings),
  exitSlideshow: () => ipcRenderer.invoke('exit-slideshow'),
  onPhotoAdded: (callback) => ipcRenderer.on('photo-added', (_event, photo) => callback(photo))
});

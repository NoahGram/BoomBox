const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('boombox', {
	openFiles: () => ipcRenderer.invoke('dialog:openFiles'),
	readAudio: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
});



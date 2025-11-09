const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		backgroundColor: '#121212',
		title: 'BoomBox',
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			nodeIntegration: false,
		}
	});

	const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
	mainWindow.loadURL(devServerUrl);

	// Open DevTools in development mode
	if (process.env.VITE_DEV_SERVER_URL) {
		mainWindow.webContents.openDevTools();
	}

	mainWindow.on('closed', () => {
		mainWindow = null;
	});
}

app.whenReady().then(() => {
	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('dialog:openFiles', async () => {
	const result = await dialog.showOpenDialog(mainWindow, {
		title: 'Add audio files',
		properties: ['openFile', 'multiSelections'],
		filters: [{ name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'm4a'] }],
	});
	return result.canceled ? [] : result.filePaths;
});

ipcMain.handle('fs:readFile', async (event, filePath) => {
	return fs.promises.readFile(filePath);
});



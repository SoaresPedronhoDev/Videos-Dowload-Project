
import { ipcMain, app, BrowserWindow, dialog } from 'electron';
import * as path from 'path';


//abrir janela principal
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 550,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js') 
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../public/index.html'));
}

// abrir outra janela
ipcMain.on('abrir-outra-janela', () => {
  const win = new BrowserWindow({
    width: 550,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile(path.join(__dirname, '../public/VideosDowloader.html'));
});

// escolher pasta de dowload

ipcMain.handle("escolher-pasta", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"]
  });

  if (result.canceled) {
    return null;
  } else {
    return result.filePaths[0];
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
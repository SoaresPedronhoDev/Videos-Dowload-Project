
import { app, BrowserWindow } from 'electron';
import * as path from 'path';

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

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

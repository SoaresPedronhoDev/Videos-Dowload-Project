
import { ipcMain, app, BrowserWindow, dialog } from 'electron';
import ytdl from "ytdl-core"; // importando ytdl-core
import * as fs from "fs";
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

// baixar video
ipcMain.handle("baixar-video", async (_event, link: string, pasta: string) => {
  try {
    if (!ytdl.validateURL(link)) {
      return { sucesso: false, mensagem: "Link inválido do YouTube." };
    }

    const info = await ytdl.getInfo(link);
    const titulo = info.videoDetails.title.replace(/[<>:"\/\\|?*]/g, ""); // remove caracteres invalidos

    const caminhoArquivo = path.join(pasta, `${titulo}.mp4`);

    const stream = ytdl(link, { quality: "highestvideo" });
    stream.pipe(fs.createWriteStream(caminhoArquivo));

    // Retorna promessa que resolve quando terminar
    return new Promise((resolve, reject) => {
      stream.on("end", () => resolve({ sucesso: true, mensagem: "Download concluído!" }));
      stream.on("error", (err) => reject({ sucesso: false, mensagem: err.message }));
    });
  } catch (err: any) {
    return { sucesso: false, mensagem: err.message };
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
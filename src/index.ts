import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import fs from "fs";
import YtDlpWrap from "yt-dlp-wrap";

// cria a janela principal do app
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 550,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // conecta com preload (canal entre front e back)
    },
  });

  // carrega a interface principal do app
  mainWindow.loadFile(path.join(__dirname, "../public/index.html"));
}

// abre a janela para o usuario escolher uma pasta de download
ipcMain.handle("escolher-pasta", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"], // só permite escolher pastas
  });

  if (result.canceled) return null;
  return result.filePaths[0];
});

// faz o download do video
ipcMain.handle("baixar-video", async (_event, link: string, pasta: string) => {
  try {
    console.log("iniciando download para:", link);

    // normaliza diferentes tipos de link do youtube
    let videoId = "";
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];

    // tenta extrair o id do video
    for (const pattern of patterns) {
      const match = link.match(pattern);
      if (match) {
        videoId = match[1];
        break;
      }
    }

    // se nao encontrou o id, o link é invalido
    if (!videoId) {
      return { sucesso: false, mensagem: "link inválido do youtube. cole um link válido." };
    }

    // reconstrói o link no formato padrao
    const normalizedLink = `https://www.youtube.com/watch?v=${videoId}`;
    console.log("link normalizado:", normalizedLink);

    // cria instancia do yt-dlp
    const ytDlpWrap = new YtDlpWrap(path.join(__dirname, "../yt-dlp.exe"));

    // tenta pegar informações do video
    let videoInfo;
    try {
      console.log("obtendo informações do video...");
      const infoResult = await ytDlpWrap.getVideoInfo(normalizedLink);
      
      // Verifica se já é um objeto ou se precisa fazer parse
      if (typeof infoResult === 'string') {
        videoInfo = JSON.parse(infoResult);
      } else {
        videoInfo = infoResult;
      }
      
      console.log("titulo do video:", videoInfo.title);
    } catch (error: any) {
      console.error("erro ao obter informações:", error.message);
      return {
        sucesso: false,
        mensagem: "não foi possível obter informações do video. verifique se o link está correto ou se o video não é privado.",
      };
    }

    // impede download de transmissões ao vivo
    if (videoInfo.is_live) {
      return { sucesso: false, mensagem: "videos ao vivo não podem ser baixados." };
    }

    // prepara nome do arquivo
    const titulo = videoInfo.title.replace(/[<>:"\/\\|?*]/g, "").substring(0, 100);
    console.log("iniciando download para:", titulo);

    // estratégias de download simplificadas
    const downloadOptions = [
      {
        format: "best",
        output: path.join(pasta, `${titulo}.%(ext)s`),
      },
      {
        format: "worst",
        output: path.join(pasta, `${titulo}.%(ext)s`),
      },
    ];

    // tenta cada estratégia de download
    for (let i = 0; i < downloadOptions.length; i++) {
      const option = downloadOptions[i];
      console.log(`tentativa ${i + 1}: ${option.format}`);

      try {
        const args = [
          normalizedLink,
          "-f", option.format,
          "-o", option.output,
          "--no-playlist",
          "--no-warnings"
        ];
        
        console.log("Executando comando:", args);
        await ytDlpWrap.exec(args);

        console.log("download concluído com sucesso");
        return { sucesso: true, mensagem: `download concluído: ${titulo}` };
      } catch (error: any) {
        console.error(`estratégia ${i + 1} falhou:`, error.message);

        if (i === downloadOptions.length - 1) {
          return {
            sucesso: false,
            mensagem: "não foi possível baixar o video. o youtube pode estar bloqueando downloads ou o video pode ter restrições.",
          };
        }

        // espera 3 segundos antes de tentar a próxima opção
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  } catch (err: any) {
    console.error("erro inesperado:", err.message);
    return { sucesso: false, mensagem: "erro inesperado: " + err.message };
  }
});

// inicializa o app
app.whenReady().then(createWindow);

// fecha o app quando todas as janelas forem fechadas (menos no macos)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

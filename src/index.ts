import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import fs from "fs";
import ytdl from "@distube/ytdl-core";
import play from "play-dl";

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 550,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "../public/index.html"));
}

// Escolher pasta de download
ipcMain.handle("escolher-pasta", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (result.canceled) return null;
  return result.filePaths[0];
});

// Baixar vídeo
ipcMain.handle("baixar-video", async (_event, link: string, pasta: string) => {
  try {
    console.log("Iniciando download para:", link);
    
    // Normaliza diferentes formatos de link
    let videoId = "";
    
    // Extrai ID do vídeo de diferentes formatos de URL
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = link.match(pattern);
      if (match) {
        videoId = match[1];
        break;
      }
    }
    
    if (!videoId) {
      return { sucesso: false, mensagem: "Link inválido do YouTube. Cole um link válido do YouTube." };
    }
    
    // Reconstrói o link no formato padrão
    const normalizedLink = `https://www.youtube.com/watch?v=${videoId}`;
    console.log("Link normalizado:", normalizedLink);

    // Valida o link
    if (!ytdl.validateURL(normalizedLink)) {
      return { sucesso: false, mensagem: "Link inválido do YouTube. Use links de vídeo válidos." };
    }

    let info;
    try {
      console.log("Obtendo informações do vídeo...");
      info = await ytdl.getInfo(normalizedLink);
      console.log("Título do vídeo:", info.videoDetails.title);
    } catch (error: any) {
      console.error("Erro ao obter informações:", error.message);
      return { 
        sucesso: false, 
        mensagem: "Não foi possível obter informações do vídeo. Verifique se o link está correto e se o vídeo não é privado." 
      };
    }

    // Verifica se é uma playlist (não suportada)
    if (info.videoDetails.isLiveContent) {
      return { sucesso: false, mensagem: "Vídeos ao vivo não podem ser baixados." };
    }

    const titulo = info.videoDetails.title.replace(/[<>:"\/\\|?*]/g, "").substring(0, 100);
    const caminhoArquivo = path.join(pasta, `${titulo}.mp4`);

    console.log("Iniciando download para:", caminhoArquivo);

    // Função para tentar download com diferentes estratégias
    const tryDownload = async (strategy: any, attempt: number): Promise<any> => {
      console.log(`Tentativa ${attempt}: ${strategy.quality} - ${strategy.filter}`);
      
      return new Promise((resolve, reject) => {
        try {
          const stream = ytdl(normalizedLink, strategy);
          const extensao = strategy.format;
          const caminhoArquivoFinal = path.join(pasta, `${titulo}.${extensao}`);
          
          const arquivo = fs.createWriteStream(caminhoArquivoFinal);
          let bytesDownloaded = 0;
          
          stream.on("data", (chunk) => {
            bytesDownloaded += chunk.length;
          });
          
          stream.on("end", () => {
            console.log(`Download concluído! Bytes baixados: ${bytesDownloaded}`);
            if (bytesDownloaded > 1000) {
              resolve({ sucesso: true, mensagem: `Download concluído: ${titulo}.${extensao}` });
            } else {
              reject({ sucesso: false, mensagem: "Arquivo muito pequeno, possível corrupção" });
            }
          });
          
          stream.on("error", (err) => {
            console.error(`Erro na estratégia ${strategy.quality}:`, err.message);
            reject(err);
          });
          
          arquivo.on("error", (err) => {
            console.error("Erro ao escrever arquivo:", err.message);
            reject(err);
          });
          
          stream.pipe(arquivo);
          
        } catch (err) {
          reject(err);
        }
      });
    };

    // Lista de estratégias de download
    const downloadStrategies = [
      { quality: "highest", filter: "audioandvideo", format: "mp4" },
      { quality: "highestvideo", filter: "videoonly", format: "mp4" },
      { quality: "highestaudio", filter: "audioonly", format: "mp3" },
      { quality: "136", filter: "videoonly", format: "mp4" },
      { quality: "140", filter: "audioonly", format: "m4a" }
    ];

    // Tenta cada estratégia sequencialmente
    for (let i = 0; i < downloadStrategies.length; i++) {
      try {
        const resultado = await tryDownload(downloadStrategies[i], i + 1);
        if (resultado.sucesso) {
          return resultado;
        }
      } catch (err: any) {
        console.error(`Estratégia ${i + 1} falhou:`, err.message);
        // Aguarda um pouco antes de tentar a próxima estratégia
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Se todas as estratégias do ytdl falharam, tenta com play-dl
    console.log("Tentando download alternativo com play-dl...");
    try {
      const stream = await play.stream(normalizedLink, { quality: 3 });
      
      const caminhoArquivoFinal = path.join(pasta, `${titulo}.mp4`);
      const arquivo = fs.createWriteStream(caminhoArquivoFinal);
      
      return new Promise((resolve, reject) => {
        let bytesDownloaded = 0;
        
        stream.stream.on("data", (chunk) => {
          bytesDownloaded += chunk.length;
        });
        
        stream.stream.on("end", () => {
          console.log(`Download alternativo concluído! Bytes baixados: ${bytesDownloaded}`);
          if (bytesDownloaded > 1000) {
            resolve({ sucesso: true, mensagem: `Download concluído (método alternativo): ${titulo}.mp4` });
          } else {
            reject({ sucesso: false, mensagem: "Arquivo muito pequeno, possível corrupção" });
          }
        });
        
        stream.stream.on("error", (err) => {
          console.error("Erro no download alternativo:", err.message);
          reject({ sucesso: false, mensagem: "Erro no download alternativo: " + err.message });
        });
        
        arquivo.on("error", (err) => {
          console.error("Erro ao escrever arquivo:", err.message);
          reject({ sucesso: false, mensagem: "Erro ao salvar arquivo: " + err.message });
        });
        
        stream.stream.pipe(arquivo);
      });
      
    } catch (playErr: any) {
      console.error("Download alternativo também falhou:", playErr.message);
      return { sucesso: false, mensagem: "Todos os métodos de download falharam. O YouTube pode estar bloqueando downloads temporariamente. Tente novamente mais tarde." };
    }

  } catch (err: any) {
    console.error("Erro inesperado:", err.message);
    return { sucesso: false, mensagem: "Erro inesperado: " + err.message };
  }
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

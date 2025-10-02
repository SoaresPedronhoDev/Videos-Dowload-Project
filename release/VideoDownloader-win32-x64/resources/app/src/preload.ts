
import { contextBridge,ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  abrirOutraJanela: () => ipcRenderer.send("abrir-outra-janela"),
  escolherPasta: () => ipcRenderer.invoke("escolher-pasta"),
  baixarVideo : (link : string, pasta : string) => ipcRenderer.invoke("baixar-video",link,pasta),
  onDownloadProgress: (callback: (progress: { percentage: number; speed: string; eta: string; status: string }) => void) => {
    ipcRenderer.on("download-progress", (event, progress) => callback(progress));
  }
});


import { contextBridge,ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  abrirOutraJanela: () => ipcRenderer.send("abrir-outra-janela"),
  escolherPasta: () => ipcRenderer.invoke("escolher-pasta"),
  baixarVideo : (link : string, pasta : string) => ipcRenderer.invoke("baixar-video",link,pasta)
});

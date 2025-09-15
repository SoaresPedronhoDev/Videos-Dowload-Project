
import { contextBridge,ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('electronAPI', {
    abrirOutraJanela: () => ipcRenderer.send('abrir-outra-janela')
    
});

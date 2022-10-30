// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("SplashAPI", {
  platform: process.platform,
  openExternal: (path: string) => {
    console.log("HERE!!!", { ipcRenderer, path });
    ipcRenderer.invoke("open-item-folder", path);
  },
});

export default contextBridge;

import { ipcRenderer } from "electron";

export const DialogAPI = {
  openFilePicker: (): Promise<string | undefined> =>
    ipcRenderer.invoke("open-filepicker"),
} as const;

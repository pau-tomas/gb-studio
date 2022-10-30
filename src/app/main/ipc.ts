import { ipcMain, shell } from "electron";
import { isString } from "@byte.london/byteguards";
import WindowManager from "./windowManager";

interface IPCOptions {
  windowManager: WindowManager;
}

export default ({ windowManager }: IPCOptions) => {
  console.log("INIT IPC", windowManager);

  ipcMain.handle("open-item-folder", async (_event, file) => {
    if (!isString(file)) throw new Error("Invalid file path");
    shell.showItemInFolder(file);
  });
};

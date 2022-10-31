import { ipcMain, shell } from "electron";
import settings from "electron-settings";
import { isString, isArray } from "@byte.london/byteguards";
import WindowManager from "./windowManager";

const isStringArray = isArray(isString);

interface IPCOptions {
  windowManager: WindowManager;
}

export default ({ windowManager }: IPCOptions) => {
  console.log("INIT IPC", windowManager);

  ipcMain.handle("open-item-folder", async (_event, file) => {
    if (!isString(file)) throw new Error("Invalid file path");
    shell.showItemInFolder(file);
  });

  ipcMain.handle("settings-get", async (_event, key) => {
    if (!isString(key)) throw new Error("Invalid setting key");
    return settings.get(key);
  });

  ipcMain.handle("get-recent-projects", async () => {
    const recentProjects = settings.get("recentProjects");
    if (!isStringArray(recentProjects)) return [];
    return recentProjects;
  });
};

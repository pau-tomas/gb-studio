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

  ipcMain.handle("open-external", async (_event, url) => {
    if (!isString(url)) throw new Error("Invalid URL");
    const allowedExternalDomains = [
      "https://www.gbstudio.dev",
      "https://www.itch.io",
      "https://github.com",
    ];
    const match = allowedExternalDomains.some((domain) =>
      url.startsWith(domain)
    );
    if (!match) throw new Error("URL not allowed");
    shell.openExternal(url);
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

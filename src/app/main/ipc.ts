import { app, dialog, ipcMain, shell } from "electron";
import settings from "electron-settings";
import path from "path";
import { isString, isArray } from "@byte.london/byteguards";
import WindowManager from "./windowManager";

const isStringArray = isArray(isString);

interface IPCOptions {
  windowManager: WindowManager;
}

export default ({ windowManager }: IPCOptions) => {
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

  ipcMain.handle("settings-set", async (_event, key, value) => {
    if (!isString(key)) throw new Error("Invalid setting key");
    return settings.set(key, value);
  });

  ipcMain.handle("get-recent-projects", async () => {
    const recentProjects = settings.get("recentProjects");
    if (!isStringArray(recentProjects)) return [];
    return recentProjects;
  });

  ipcMain.handle("get-documents-path", async (_event) => {
    return app.getPath("documents");
  });

  ipcMain.handle("open-directory-picker", async () => {
    const selection = await dialog.showOpenDialogSync({
      properties: ["openDirectory"],
    });
    if (selection && selection[0]) {
      return path.normalize(`${selection[0]}/`);
    }
    return undefined;
  });

  ipcMain.handle("open-project-filepicker", () => {
    const files = dialog.showOpenDialogSync({
      properties: ["openFile"],
      filters: [
        {
          name: "Projects",
          extensions: ["gbsproj", "json"],
        },
      ],
    });
    if (files && files[0]) {
      console.log("OPEN PROJECT", files[0]);
      // keepOpen = true;
      // if (mainWindow) {
      //   mainWindow.close();
      //   await waitUntilWindowClosed();
      // }

      // openProject(files[0]);

      // keepOpen = false;
    }
  });
};

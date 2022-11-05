import { app, dialog, ipcMain, nativeTheme, shell } from "electron";
import settings from "electron-settings";
import path from "path";
import { isString, isArray } from "@byte.london/byteguards";
import loadProject from "lib/project/loadProjectData";

const isStringArray = isArray(isString);

export interface CreateProjectInput {
  name: string;
  template: string;
  path: string;
}

export interface CreateProjectOptions {
  openOnSuccess?: boolean;
}

interface IPCOptions {
  onCreateProject: (
    input: CreateProjectInput,
    options?: CreateProjectOptions
  ) => Promise<void>;
  onSelectProjectToOpen: () => Promise<void>;
  onOpenProject: (projectPath: string) => Promise<void>;
}

export default ({
  onCreateProject,
  onSelectProjectToOpen,
  onOpenProject,
}: IPCOptions) => {
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
    settings.set(key, value);
  });

  ipcMain.handle(
    "get-theme-should-use-dark-colors",
    () => nativeTheme.shouldUseDarkColors
  );

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

  ipcMain.handle("open-project-filepicker", onSelectProjectToOpen);

  ipcMain.handle("open-filepicker", () => {
    const files = dialog.showOpenDialogSync({
      properties: ["openFile"],
    });
    if (files && files[0]) {
      console.log("FILE", files[0]);
      console.log("NORM", path.normalize(files[0]));
      return files[0];
    }
    return undefined;
  });

  ipcMain.handle("open-project", (_, projectPath: string) =>
    onOpenProject(projectPath)
  );

  ipcMain.handle(
    "create-project",
    async (_event, input: CreateProjectInput, options?: CreateProjectOptions) =>
      onCreateProject(input, options)
  );

  ipcMain.handle("load-project", async (_event, projectPath: string) => {
    return loadProject(projectPath);
  });

  ipcMain.handle(
    "build-project",
    async (_event, projectPath: string, projectData: unknown) => {
      console.log("BUILD PROJECT");
      console.log(projectData);
    }
  );
};

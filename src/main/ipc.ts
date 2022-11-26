import { app, dialog, ipcMain, nativeTheme, shell } from "electron";
import settings from "electron-settings";
import path from "path";
import { isString, isArray } from "@byte.london/byteguards";
import loadProject from "lib/project/loadProjectData";
import { l10nStrings } from "lib/helpers/l10n";
import getTmp from "lib/helpers/getTmp";
import pkg from "package.json";
import { getBackgroundInfo } from "lib/backgrounds/validation";
import type {
  Background,
  SpriteSheetData,
} from "renderer/project/store/features/entities/entitiesTypes";
import { compileSprite } from "lib/compiler/compileSprites";

declare const COMMITHASH: string;

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
  onSetWindowZoom: (zoomLevel: number) => Promise<void>;
  onSetTrackerKeyBindings: (zoomLevel: number) => Promise<void>;
  onOpenPlayWindow: (outputRoot: string, sgbMode: boolean) => Promise<void>;
  onOpenHelp: (page: string) => Promise<void>;
  onOpenAsset: (filePath: string, type: string) => Promise<void>;
}

const initIPC = ({
  onCreateProject,
  onSelectProjectToOpen,
  onOpenProject,
  onSetWindowZoom,
  onSetTrackerKeyBindings,
  onOpenPlayWindow,
  onOpenHelp,
  onOpenAsset,
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

  ipcMain.handle("get-app-info", async () => {
    return {
      name: app.getName(),
      version: app.getVersion(),
      homepage: pkg.homepage,
      bugReportUrl: pkg.bugs.url,
      commitHash: COMMITHASH,
    };
  });

  ipcMain.handle("open-play", async (_event, outputRoot, sgbMode) => {
    const url = `file://${outputRoot}/build/web/index.html`;
    onOpenPlayWindow(url, sgbMode);
  });

  ipcMain.handle("settings-get", async (_event, key) => {
    if (!isString(key)) throw new Error("Invalid setting key");
    return settings.get(key);
  });

  ipcMain.handle("settings-set", async (_event, key, value) => {
    if (!isString(key)) throw new Error("Invalid setting key");
    settings.set(key, value);
  });

  ipcMain.handle("settings-delete", async (_event, key) => {
    if (!isString(key)) throw new Error("Invalid setting key");
    settings.delete(key);
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

  ipcMain.handle("clear-recent-projects", async () => {
    settings.set("recentProjects", []);
    app.clearRecentDocuments();
  });

  ipcMain.handle("get-documents-path", async (_event) => {
    return app.getPath("documents");
  });

  ipcMain.handle("get-tmp-path", async () => {
    return getTmp();
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

  ipcMain.handle("l10n-get-lang-data", () => {
    return l10nStrings;
  });

  ipcMain.handle("set-zoom-level", (_event, zoomLevel: number) => {
    onSetWindowZoom(zoomLevel);
  });

  ipcMain.handle("set-tracker-keybindings", (_, value: number) => {
    onSetTrackerKeyBindings(value);
  });

  ipcMain.handle("open-help", (_event, page) => onOpenHelp(page));

  ipcMain.handle("open-asset", (_event, filePath: string, type: string) =>
    onOpenAsset(filePath, type)
  );

  ipcMain.handle("show-error", (_event, title: string, content: string) => {
    dialog.showErrorBox(title, content);
  });

  ipcMain.handle(
    "project:get-background-info",
    (_event, background: Background, is360: boolean, projectPath: string) => {
      return getBackgroundInfo(background, is360, projectPath);
    }
  );

  ipcMain.handle(
    "project:compile-sprite",
    (_event, spriteSheet: SpriteSheetData, projectRoot: string) => {
      return compileSprite(spriteSheet, projectRoot);
    }
  );
};

export default initIPC;

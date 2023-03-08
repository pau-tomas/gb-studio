import { app, dialog, ipcMain, nativeTheme, shell } from "electron";
import settings from "electron-settings";
import path from "path";
import { isString, isArray } from "@byte.london/byteguards";
import { l10nStrings } from "shared/lib/l10n";
import getTmp from "lib/helpers/getTmp";
import pkg from "package.json";
import { getBackgroundInfo } from "lib/backgrounds/validation";
import type {
  Background,
  SpriteSheetData,
} from "renderer/project/store/features/entities/entitiesTypes";
import { compileSprite } from "lib/compiler/compileSprites";
import ProjectManager from "./projectManager";
import Project from "./project";
import WindowManager from "./windowManager";
import type { ProjectData } from "renderer/project/store/features/project/projectActions";

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
  projectManager: ProjectManager;
  windowManager: WindowManager;
  onCreateProject: (
    input: CreateProjectInput,
    options?: CreateProjectOptions
  ) => Promise<void>;
  onSelectProjectToOpen: () => Promise<void>;
  onOpenProject: (projectPath: string) => Promise<void>;
  onLoadedProject: (projectData: ProjectData) => Promise<void>;
  onSetWindowZoom: (zoomLevel: number) => Promise<void>;
  onSetTrackerKeyBindings: (zoomLevel: number) => Promise<void>;
  onOpenPlayWindow: (outputRoot: string, sgbMode: boolean) => Promise<void>;
  onOpenHelp: (page: string) => Promise<void>;
  onOpenAsset: (filePath: string, type: string) => Promise<void>;
  onSaveProject: (filePath: string, data: ProjectData) => Promise<void>;
  onSaveProjectAs: (
    filePath: string,
    newFilePath: string,
    data: ProjectData
  ) => Promise<void>;
  onSetShowNavigator: (showNavigator: boolean) => Promise<void>;
}

const initIPC = ({
  projectManager,
  windowManager,
  onCreateProject,
  onSelectProjectToOpen,
  onOpenProject,
  onSetWindowZoom,
  onSetTrackerKeyBindings,
  onOpenPlayWindow,
  onOpenHelp,
  onOpenAsset,
  onSaveProject,
  onSaveProjectAs,
  onLoadedProject,
  onSetShowNavigator,
}: IPCOptions) => {
  const getEventProject = (event: Electron.IpcMainInvokeEvent): Project => {
    const project = projectManager.getProject(event.processId);
    if (!project) {
      throw new Error("No project open for window");
    }
    return project;
  };

  ipcMain.handle("project:open-item-folder", async (event, file) => {
    if (!isString(file)) throw new Error("Invalid file path");
    const project = getEventProject(event);
    const projectRoot = project.getRoot();
    if (!projectRoot) throw new Error("Project must be loaded to open path");
    if (!file.startsWith(projectRoot))
      throw new Error("File must be within open project");
    shell.showItemInFolder(file);
  });

  ipcMain.handle("project:open-path", async (event, file) => {
    if (!isString(file)) throw new Error("Invalid file path");
    const project = getEventProject(event);
    const projectRoot = project.getRoot();
    if (!projectRoot) throw new Error("Project must be loaded to open path");
    if (!file.startsWith(projectRoot))
      throw new Error("File must be within open project");
    shell.openPath(file);
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

  ipcMain.handle("get-is-full-screen", () =>
    windowManager.projectWindow?.isFullScreen()
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

  ipcMain.handle("open-project", (event, projectPath: string) => {
    return onOpenProject(projectPath);
  });

  ipcMain.handle(
    "create-project",
    async (_event, input: CreateProjectInput, options?: CreateProjectOptions) =>
      onCreateProject(input, options)
  );

  ipcMain.handle("load-project", async (event) => {
    const project = getEventProject(event);
    const data = await project.getData();
    onLoadedProject(data.data);
    return data;
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

  ipcMain.handle("set-show-navigator", (_event, showNavigator: boolean) => {
    onSetShowNavigator(showNavigator);
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
    "project:save",
    async (event, data: ProjectData, saveAs?: boolean) => {
      const project = getEventProject(event);
      const projectPath = project.getFilename();
      if (!projectPath) throw new Error("Project must be loaded to open path");
      if (saveAs) {
        const newProjectPath = dialog.showSaveDialogSync({
          filters: [
            {
              name: "Projects",
              extensions: ["gbsproj", "json"],
            },
          ],
        });
        if (newProjectPath) {
          await onSaveProjectAs(projectPath, newProjectPath, data);
          project.setFilename(newProjectPath);
          windowManager.setDocumentModified(false);
          return newProjectPath;
        }
      } else {
        await onSaveProject(projectPath, data);
        windowManager.setDocumentModified(false);
        return projectPath;
      }
    }
  );

  ipcMain.handle(
    "project:compile-sprite",
    (_event, spriteSheet: SpriteSheetData, projectRoot: string) => {
      return compileSprite(spriteSheet, projectRoot);
    }
  );

  ipcMain.handle("project:modified", () => {
    windowManager.setDocumentModified(true);
  });
};

export default initIPC;

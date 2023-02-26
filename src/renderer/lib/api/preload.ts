import { ipcRenderer } from "electron";
import type { BackgroundInfo } from "lib/backgrounds/validation";
import type { PrecompiledSpriteSheetData } from "lib/compiler/compileSprites";
import type {
  Background,
  SpriteSheetData,
} from "renderer/project/store/features/entities/entitiesTypes";
import { NavigationSection } from "renderer/project/store/features/navigation/navigationState";
import type { ProjectData } from "renderer/project/store/features/project/projectActions";

type JsonValue = string | number | boolean | null;

export const API = {
  platform: process.platform,
  getL10NData: async () => {
    return await ipcRenderer.invoke("l10n-get-lang-data");
  },
  openExternal: (path: string) => ipcRenderer.invoke("open-external", path),
  app: {
    processVersions: process.versions,
    getInfo: () => ipcRenderer.invoke("get-app-info"),
    setZoomLevel: (zoomLevel: number) =>
      ipcRenderer.invoke("set-zoom-level", zoomLevel),
    setTrackerKeyBindings: (value: number) =>
      ipcRenderer.invoke("set-tracker-keybindings", value),
    openHelp: (page: string) => ipcRenderer.invoke("open-help", page),
    onEnterFullScreen: (callback: () => void) =>
      ipcRenderer.on("enter-full-screen", callback),
    onLeaveFullScreen: (callback: () => void) =>
      ipcRenderer.on("leave-full-screen", callback),
    isFullScreen: (): Promise<boolean> =>
      ipcRenderer.invoke("get-is-full-screen"),
    onUndo: (callback: () => void) => ipcRenderer.on("undo", callback),
    onRedo: (callback: () => void) => ipcRenderer.on("redo", callback),
  },
  theme: {
    getShouldUseDarkColors: () =>
      ipcRenderer.invoke("get-theme-should-use-dark-colors"),
    getThemeSetting: () => ipcRenderer.invoke("settings-get", "theme"),
    onChange: (callback: () => void) =>
      ipcRenderer.on("update-theme", callback),
  },
  paths: {
    getDocumentsPath: () => ipcRenderer.invoke("get-documents-path"),
    getTmpPath: () => ipcRenderer.invoke("get-tmp-path"),
  },
  settings: {
    get: (key: string) => ipcRenderer.invoke("settings-get", key),
    set: (key: string, value: JsonValue) =>
      ipcRenderer.invoke("settings-set", key, value),
    delete: (key: string) => ipcRenderer.invoke("settings-delete", key),
  },
  dialog: {
    chooseDirectory: (): Promise<string | undefined> =>
      ipcRenderer.invoke("open-directory-picker"),
    openFilePicker: (): Promise<string | undefined> =>
      ipcRenderer.invoke("open-filepicker"),
    showError: (title: string, content: string) =>
      ipcRenderer.invoke("show-error", title, content),
  },
  project: {
    openProjectFilePicker: () => ipcRenderer.invoke("open-project-filepicker"),
    getRecentProjects: (): Promise<string[]> =>
      ipcRenderer.invoke("get-recent-projects"),
    clearRecentProjects: () => ipcRenderer.invoke("clear-recent-projects"),
    createProject: (
      input: {
        name: string;
        template: string;
        path: string;
      },
      options?: {
        openOnSuccess?: boolean;
      }
    ) => ipcRenderer.invoke("create-project", input, options),
    openProject: (filePath: string) =>
      ipcRenderer.invoke("open-project", filePath),
    loadProjectData: () => ipcRenderer.invoke("load-project"),
    buildProject: (projectPath: string, projectData: unknown) =>
      ipcRenderer.invoke("build-project", projectPath, projectData),
    openPlayWindow: (outputRoot: string, sgbMode: boolean) =>
      ipcRenderer.invoke("open-play", outputRoot, sgbMode),
    openAsset: (filePath: string, type?: "music" | "image" | undefined) =>
      ipcRenderer.invoke("open-asset", filePath, type),
    getBackgroundInfo: (
      background: Background,
      is360: boolean,
      projectPath: string
    ): Promise<BackgroundInfo> =>
      ipcRenderer.invoke(
        "project:get-background-info",
        background,
        is360,
        projectPath
      ),
    compileSprite: async (
      spriteSheet: SpriteSheetData,
      projectRoot: string
    ): Promise<PrecompiledSpriteSheetData> =>
      ipcRenderer.invoke("project:compile-sprite", spriteSheet, projectRoot),
    openItemFolder: (path: string) =>
      ipcRenderer.invoke("project:open-item-folder", path),
    openPath: (path: string) => ipcRenderer.invoke("project:open-path", path),
    onRequestSave: (callback: (saveAs?: boolean) => void) =>
      ipcRenderer.on("request-save", (_event, saveAs: boolean) => {
        callback(saveAs);
      }),
    saveProjectData: (data: ProjectData, saveAs?: boolean) =>
      ipcRenderer.invoke("project:save", data, saveAs),
    onZoom: (callback: (direction: "in" | "out" | "reset") => void) =>
      ipcRenderer.on(
        "project:zoom",
        (_event, direction: "in" | "out" | "reset") => callback(direction)
      ),
    onSetSection: (callback: (section: NavigationSection) => void) =>
      ipcRenderer.on("project:section", (_event, section: NavigationSection) =>
        callback(section)
      ),
    setModified: () => ipcRenderer.invoke("project:modified"),
  },
} as const;

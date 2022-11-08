import { ipcRenderer } from "electron";
import path from "path";
import l10n, { setLanguageData } from "lib/helpers/l10n";

type JsonValue = string | number | boolean | null;

export const API = {
  platform: process.platform,
  l10n: (key: string, params?: Record<string, string | number>) =>
    l10n(key, params),
  l10nInit: async () => {
    setLanguageData(await ipcRenderer.invoke("l10n-get-lang-data"));
  },
  openExternal: (path: string) => ipcRenderer.invoke("open-external", path),
  app: {
    setZoomLevel: (zoomLevel: number) =>
      ipcRenderer.invoke("set-zoom-level", zoomLevel),
    setTrackerKeyBindings: (value: number) =>
      ipcRenderer.invoke("set-tracker-keybindings", value),
  },
  theme: {
    getShouldUseDarkColors: () =>
      ipcRenderer.invoke("get-theme-should-use-dark-colors"),
    getThemeSetting: () => ipcRenderer.invoke("settings-get", "theme"),
    onChange: (callback: () => void) => {
      ipcRenderer?.on("update-theme", callback);
    },
  },
  path: {
    basename: (input: string) => path.basename(input),
    dirname: (input: string) => path.dirname(input),
    normalize: (input: string) => path.normalize(input),
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
    loadProjectData: (projectPath: string) =>
      ipcRenderer.invoke("load-project", projectPath),
    buildProject: (projectPath: string, projectData: unknown) =>
      ipcRenderer.invoke("build-project", projectPath, projectData),
  },
} as const;

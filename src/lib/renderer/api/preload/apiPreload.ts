import { ipcRenderer } from "electron";
import path from "path";
import l10n from "lib/helpers/l10n";

type JsonValue = string | number | boolean | null;

export const API = {
  platform: process.platform,
  l10n: (key: string, params?: Record<string, string | number>) =>
    l10n(key, params),
  openExternal: (path: string) => ipcRenderer.invoke("open-external", path),
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
  },
  settings: {
    get: (key: string) => ipcRenderer.invoke("settings-get", key),
    set: (key: string, value: JsonValue) => {
      console.log("INVOKE SET", { key, value });
      ipcRenderer.invoke("settings-set", key, value);
    },
  },
  dialog: {
    chooseDirectory: (): Promise<string | undefined> =>
      ipcRenderer.invoke("open-directory-picker"),
  },
  project: {
    openProjectFilePicker: () => ipcRenderer.invoke("open-project-filepicker"),
    getRecentProjects: (): Promise<string[]> =>
      ipcRenderer.invoke("get-recent-projects"),
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

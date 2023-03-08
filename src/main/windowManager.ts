import { app, BrowserWindow, dialog, nativeTheme } from "electron";
import windowStateKeeper from "electron-window-state";
import l10n from "shared/lib/l10n";
import { checkForUpdate } from "lib/helpers/updateChecker";
import Project from "./project";
import ProjectManager from "./projectManager";
import installExtension, {
  REDUX_DEVTOOLS,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import type { NavigationSection } from "renderer/project/store/features/navigation/navigationState";
import type { SettingsState } from "renderer/project/store/features/settings/settingsState";

declare const ABOUT_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const ABOUT_WINDOW_WEBPACK_ENTRY: string;
declare const SPLASH_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const SPLASH_WINDOW_WEBPACK_ENTRY: string;
declare const PROJECT_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const PROJECT_WINDOW_WEBPACK_ENTRY: string;
declare const PREFERENCES_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const PREFERENCES_WINDOW_WEBPACK_ENTRY: string;

type SplashTab = "info" | "new" | "recent";

const isDevMode = !!process.execPath.match(/[\\/]electron/);

interface WindowManagerProps {
  setApplicationMenu: () => void;
  uiScale: number;
}

export default class WindowManager {
  projectManager: ProjectManager;
  keepOpen = false;
  mainWindowCloseCancelled = false;
  documentName = "";
  documentEdited = false;
  aboutWindow?: BrowserWindow;
  splashWindow?: BrowserWindow;
  preferencesWindow?: BrowserWindow;
  projectWindow?: BrowserWindow;
  playWindow?: BrowserWindow;
  musicWindow?: BrowserWindow;
  playWindowSgb?: boolean;
  hasCheckedForUpdate = false;
  setApplicationMenu?: () => void;
  uiScale = 0;

  private createAboutWindow() {
    const win = new BrowserWindow({
      width: 400,
      height: 400,
      useContentSize: true,
      resizable: false,
      maximizable: false,
      fullscreenable: false,
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
        webSecurity: true,
        contextIsolation: true,
        devTools: isDevMode,
        preload: ABOUT_WINDOW_PRELOAD_WEBPACK_ENTRY,
      },
    });

    if (!win) return;
    this.aboutWindow = win;

    win.setMenu(null);
    win.loadURL(ABOUT_WINDOW_WEBPACK_ENTRY);
    injectDevTools(win);

    win.once("ready-to-show", () => {
      win.show();
    });

    win.on("closed", () => {
      this.aboutWindow = undefined;
    });
  }

  private createSplashWindow(forceTab?: SplashTab) {
    const win = new BrowserWindow({
      width: 640,
      height: 400,
      useContentSize: true,
      resizable: false,
      maximizable: false,
      titleBarStyle: "hiddenInset",
      fullscreenable: false,
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
        devTools: isDevMode,
        preload: SPLASH_WINDOW_PRELOAD_WEBPACK_ENTRY,
      },
    });

    if (!win) return;
    this.splashWindow = win;

    this.setApplicationMenu?.();
    win.setMenu(null);
    win.loadURL(`${SPLASH_WINDOW_WEBPACK_ENTRY}?tab=${forceTab || ""}`);
    injectDevTools(win);

    win.once("ready-to-show", () => {
      win.show();
      if (!this.hasCheckedForUpdate) {
        this.hasCheckedForUpdate = true;
        checkForUpdate();
      }
    });

    win.on("closed", () => {
      this.splashWindow = undefined;
    });
  }

  private createPreferences() {
    const win = new BrowserWindow({
      width: 600,
      height: 400,
      resizable: false,
      maximizable: false,
      fullscreenable: false,
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
        webSecurity: true,
        contextIsolation: true,
        devTools: isDevMode,
        preload: PREFERENCES_WINDOW_PRELOAD_WEBPACK_ENTRY,
      },
    });
    if (!win) return;
    this.preferencesWindow = win;

    win.setMenu(null);
    win.loadURL(PREFERENCES_WINDOW_WEBPACK_ENTRY);
    injectDevTools(win);

    win.once("ready-to-show", () => {
      win.show();
    });

    win.on("closed", () => {
      this.preferencesWindow = undefined;
    });
  }

  private createProjectWindow(project: Project) {
    const mainWindowState = windowStateKeeper({
      defaultWidth: 1000,
      defaultHeight: 800,
    });

    // Create the browser window.
    const win = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: Math.max(640, mainWindowState.width),
      height: Math.max(600, mainWindowState.height),
      minWidth: 640,
      minHeight: 600,
      titleBarStyle: "hiddenInset",
      fullscreenable: true,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        webSecurity: process.env.NODE_ENV !== "development", // Required to allow reading file:// when in devMode
        contextIsolation: true,
        devTools: isDevMode,
        preload: PROJECT_WINDOW_PRELOAD_WEBPACK_ENTRY,
      },
    });

    if (!win) return;
    this.projectWindow = win;

    this.mainWindowCloseCancelled = false;

    mainWindowState.manage(win);

    this.setApplicationMenu?.();

    win.loadURL(PROJECT_WINDOW_WEBPACK_ENTRY);
    injectDevTools(win);

    win.setRepresentedFilename(project.getFilename());

    let processId = 0;

    win.once("ready-to-show", () => {
      win.show();
      win.webContents.send("win:set-ui-scale", this.uiScale);
      processId = win.webContents.getProcessId();
      ProjectManager.getInstance().registerProject(processId, project);
    });

    win.on("enter-full-screen", () => {
      win?.webContents.send("enter-full-screen");
    });

    win.on("leave-full-screen", () => {
      win?.webContents.send("leave-full-screen");
    });

    win.on("page-title-updated", (e, title) => {
      this.documentName = title
        .replace(/^GB Studio -/, "")
        .replace(/\(modified\)$/, "")
        .trim();
    });

    win.on("close", (e) => {
      if (this.documentEdited && win) {
        this.mainWindowCloseCancelled = false;
        const choice = dialog.showMessageBoxSync(win, {
          type: "question",
          buttons: [
            l10n("DIALOG_SAVE"),
            l10n("DIALOG_CANCEL"),
            l10n("DIALOG_DONT_SAVE"),
          ],
          defaultId: 0,
          cancelId: 1,
          message: l10n("DIALOG_SAVE_CHANGES", { name: this.documentName }),
          detail: l10n("DIALOG_SAVE_WARNING"),
        });
        if (choice === 0) {
          // Save
          e.preventDefault();
          this.requestSaveAndQuit();
        } else if (choice === 1) {
          // Cancel
          e.preventDefault();
          this.keepOpen = false;
          this.mainWindowCloseCancelled = true;
        } else {
          // Don't Save
        }
      }
    });

    win.on("closed", () => {
      this.projectWindow = undefined;
      this.setApplicationMenu?.();
      ProjectManager.getInstance().closeProject(processId);

      if (this.musicWindow) {
        this.musicWindow.destroy();
      }
    });
  }

  private createPlayWindow(url: string, sgb: boolean) {
    if (this.playWindow && sgb !== this.playWindowSgb) {
      this.playWindow.close();
      this.playWindow = undefined;
    }

    const win = new BrowserWindow({
      width: sgb ? 512 : 480,
      height: sgb ? 448 : 432,
      fullscreenable: false,
      autoHideMenuBar: true,
      useContentSize: true,
      webPreferences: {
        nodeIntegration: false,
        webSecurity: true,
        contextIsolation: true,
      },
    });

    if (!win) return;
    this.playWindow = win;

    win.setMenu(null);
    win.loadURL(`${url}?audio=true&sgb=${sgb ? "true" : "false"}`);
    injectDevTools(win);

    win.on("closed", () => {
      this.playWindow = undefined;
    });
  }

  setSplashTab(tab?: SplashTab) {
    if (this.splashWindow) {
      this.splashWindow.loadURL(
        `${SPLASH_WINDOW_WEBPACK_ENTRY}?tab=${tab || ""}`
      );
    }
  }

  waitUntilProjectClosed(): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (!this.projectWindow) {
          resolve();
        } else {
          setTimeout(check, 10);
        }
      };
      check();
    });
  }

  waitUntilSplashClosed(): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (!this.splashWindow) {
          resolve();
        } else {
          setTimeout(check, 10);
        }
      };
      check();
    });
  }

  async openSplashWindow(forceTab?: SplashTab) {
    this.keepOpen = true;
    if (this.projectWindow) {
      this.projectWindow.close();
      await this.waitUntilProjectClosed();
    }
    if (this.splashWindow) {
      this.setSplashTab(forceTab);
    } else {
      await this.createSplashWindow(forceTab);
    }
    this.keepOpen = false;
  }

  async openPreferencesWindow() {
    if (!this.preferencesWindow) {
      this.createPreferences();
    } else {
      this.preferencesWindow.show();
    }
  }

  async openAboutWindow() {
    if (!this.aboutWindow) {
      this.createAboutWindow();
    } else {
      this.aboutWindow.show();
    }
  }

  async openProject(project: Project) {
    this.keepOpen = true;
    if (this.splashWindow) {
      this.splashWindow.close();
    }
    if (!this.projectWindow) {
      this.createProjectWindow(project);
    } else {
      this.keepOpen = true;
      this.projectWindow.close();
      await this.waitUntilProjectClosed();
      this.createProjectWindow(project);
    }
    this.keepOpen = false;
  }

  async openPlayWindow(url: string, sgbMode: boolean) {
    this.createPlayWindow(url, sgbMode);
  }

  async notifyThemeUpdate() {
    this.projectWindow?.webContents.send("update-theme");
    this.splashWindow?.webContents.send("update-theme");
    this.preferencesWindow?.webContents.send("update-theme");
    this.aboutWindow?.webContents.send("update-theme");
  }

  async notifyUIScale(zoomLevel: number) {
    this.uiScale = zoomLevel;
    this.projectWindow?.webContents.send("win:set-ui-scale", this.uiScale);
  }

  async notifyTrackerKeyBindings(value: number) {
    this.projectWindow?.webContents.send("keybindings-update", value);
  }

  async requestSave(saveAs?: boolean) {
    this.projectWindow?.webContents.send("request-save", saveAs);
  }

  async requestSaveAndQuit() {
    this.projectWindow?.webContents.send("request-save-and-quit");
  }

  async zoomIn() {
    this.projectWindow?.webContents.send("project:zoom", "in");
  }

  async zoomOut() {
    this.projectWindow?.webContents.send("project:zoom", "out");
  }

  async zoomReset() {
    this.projectWindow?.webContents.send("project:zoom", "reset");
  }

  async updateSetting<K extends keyof SettingsState>(
    setting: K,
    value: SettingsState[K]
  ) {
    this.projectWindow?.webContents.send(
      "project:update-setting",
      setting,
      value
    );
  }

  async undo() {
    this.projectWindow?.webContents.send("undo");
  }

  async redo() {
    this.projectWindow?.webContents.send("redo");
  }

  async setSection(section: NavigationSection) {
    this.projectWindow?.webContents.send("project:section", section);
  }

  async setDocumentModified(modified: boolean) {
    this.projectWindow?.setDocumentEdited(modified);
    this.documentEdited = modified;
  }

  isProjectWindowOpen() {
    return !!this.projectWindow;
  }

  constructor(projectManager: ProjectManager) {
    this.projectManager = projectManager;
  }

  init({ setApplicationMenu, uiScale }: WindowManagerProps) {
    this.setApplicationMenu = setApplicationMenu;
    this.uiScale = uiScale;

    app.whenReady().then(() => {
      this.createSplashWindow();
      app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createSplashWindow();
        }
      });
    });

    nativeTheme?.on("updated", () => {
      this.notifyThemeUpdate();
    });

    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        if (!this.keepOpen) {
          app.quit();
        }
      }
    });
  }
}

const injectDevTools = (win: BrowserWindow) => {
  if (isDevMode) {
    win.webContents.once("dom-ready", async () => {
      await installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS])
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log("An error occurred: ", err));
    });
  }
};

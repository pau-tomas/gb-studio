import { app, BrowserWindow, dialog, nativeTheme } from "electron";
import windowStateKeeper from "electron-window-state";
import l10n from "lib/helpers/l10n";
import { checkForUpdate } from "lib/helpers/updateChecker";

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
}

export default class WindowManager {
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

    win.once("ready-to-show", () => {
      win.show();
    });

    win.on("closed", () => {
      this.preferencesWindow = undefined;
    });
  }

  private createProjectWindow(projectPath: string) {
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

    win.loadURL(
      `${PROJECT_WINDOW_WEBPACK_ENTRY}?path=${encodeURIComponent(projectPath)}`
    );

    win.setRepresentedFilename(projectPath);

    win.once("ready-to-show", () => {
      win?.webContents.send("open-project", projectPath);
      win.show();
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
          win.webContents.send("save-project-and-close");
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

  async openProject(projectPath: string) {
    this.keepOpen = true;
    if (this.splashWindow) {
      this.splashWindow.close();
    }
    if (!this.projectWindow) {
      this.createProjectWindow(projectPath);
    } else {
      this.keepOpen = true;
      this.projectWindow.close();
      await this.waitUntilProjectClosed();
      this.createProjectWindow(projectPath);
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

  async notifyWindowZoom(zoomLevel: number) {
    this.projectWindow?.webContents.send("windowZoom", zoomLevel);
  }

  async notifyTrackerKeyBindings(value: number) {
    this.projectWindow?.webContents.send("keybindings-update", value);
  }

  isProjectWindowOpen() {
    return !!this.projectWindow;
  }

  init({ setApplicationMenu }: WindowManagerProps) {
    this.setApplicationMenu = setApplicationMenu;

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

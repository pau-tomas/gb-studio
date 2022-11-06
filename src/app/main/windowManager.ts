import { app, BrowserWindow, nativeTheme } from "electron";
import { checkForUpdate } from "lib/helpers/updateChecker";

declare const SPLASH_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const SPLASH_WINDOW_WEBPACK_ENTRY: string;
declare const PREFERENCES_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const PREFERENCES_WINDOW_WEBPACK_ENTRY: string;

type SplashTab = "info" | "new" | "recent";

const isDevMode = !!process.execPath.match(/[\\/]electron/);

interface WindowManagerProps {
  setApplicationMenu: () => void;
}

export default class WindowManager {
  keepOpen = false;
  splashWindow?: BrowserWindow;
  preferencesWindow?: BrowserWindow;
  projectWindow?: BrowserWindow;
  hasCheckedForUpdate = false;
  setApplicationMenu?: () => void;

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

    win.webContents.on("did-finish-load", () => {
      setTimeout(() => {
        win?.show();
        if (!this.hasCheckedForUpdate) {
          this.hasCheckedForUpdate = true;
          checkForUpdate();
        }
      }, 40);
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
        devTools: isDevMode,
        preload: PREFERENCES_WINDOW_PRELOAD_WEBPACK_ENTRY,
      },
    });
    if (!win) return;
    this.preferencesWindow = win;

    win.setMenu(null);
    win.loadURL(PREFERENCES_WINDOW_WEBPACK_ENTRY);

    win.webContents.on("did-finish-load", () => {
      setTimeout(() => {
        win?.show();
      }, 40);
    });

    win.on("closed", () => {
      this.preferencesWindow = undefined;
    });
  }

  setSplashTab(tab?: SplashTab) {
    if (this.splashWindow) {
      this.splashWindow.loadURL(
        `${SPLASH_WINDOW_WEBPACK_ENTRY}?tab=${tab || ""}`
      );
    }
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

    // if (mainWindow) {
    //   mainWindow.close();
    //   await waitUntilWindowClosed();
    // }
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

  async openProject(projectPath: string) {
    console.log("@TODO Open Project", projectPath);
  }

  async notifyThemeUpdate() {
    this.splashWindow?.webContents.send("update-theme");
    this.preferencesWindow?.webContents.send("update-theme");
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
      this.splashWindow?.webContents.send("update-theme");
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

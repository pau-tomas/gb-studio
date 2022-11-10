import { app, BrowserWindow, nativeTheme } from "electron";
import { checkForUpdate } from "lib/helpers/updateChecker";

declare const ABOUT_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const ABOUT_WINDOW_WEBPACK_ENTRY: string;
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
  aboutWindow?: BrowserWindow;
  splashWindow?: BrowserWindow;
  preferencesWindow?: BrowserWindow;
  projectWindow?: BrowserWindow;
  playWindow?: BrowserWindow;
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
        webSecurity: process.env.NODE_ENV !== "development",
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

  async openAboutWindow() {
    if (!this.aboutWindow) {
      this.createAboutWindow();
    } else {
      this.aboutWindow.show();
    }
  }

  async openProject(projectPath: string) {
    console.log("@TODO Open Project", projectPath);
  }

  async openPlayWindow(url: string, sgbMode: boolean) {
    this.createPlayWindow(url, sgbMode);
  }

  async notifyThemeUpdate() {
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

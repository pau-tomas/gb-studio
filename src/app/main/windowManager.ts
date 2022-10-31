import { app, BrowserWindow } from "electron";
import { checkForUpdate } from "lib/helpers/updateChecker";

declare const SPLASH_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const SPLASH_WINDOW_WEBPACK_ENTRY: string;

type SplashTab = "info" | "new" | "recent";

const isDevMode = !!process.execPath.match(/[\\/]electron/);

interface WindowManagerProps {
  setApplicationMenu: (projectOpen: boolean) => void;
}

export default class WindowManager {
  keepOpen = false;
  splashWindow?: BrowserWindow;
  hasCheckedForUpdate = false;
  setApplicationMenu?: (projectOpen: boolean) => void;

  createSplashWindow(forceTab?: SplashTab) {
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

    this.setApplicationMenu?.(false);
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

    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        if (!this.keepOpen) {
          app.quit();
        }
      }
    });
  }
}

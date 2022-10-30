import { app, BrowserWindow } from "electron";

declare const SPLASH_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const SPLASH_WINDOW_WEBPACK_ENTRY: string;

export default class WindowManager {
  splashWindow?: BrowserWindow;

  constructor() {}

  createWindow() {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        contextIsolation: true,
        preload: SPLASH_WINDOW_PRELOAD_WEBPACK_ENTRY, //path.join(__dirname, 'preload.js')
      },
    });

    const forceTab = "";

    win.loadFile("index.html");
    win.loadURL(`${SPLASH_WINDOW_WEBPACK_ENTRY}?tab=${forceTab || ""}`);

    this.splashWindow = win;
  }

  init() {
    app.whenReady().then(() => {
      this.createWindow();
      app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow();
        }
      });
    });

    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });
  }
}

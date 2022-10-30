// import { app, BrowserWindow, ipcMain, shell } from "electron";
import { Menu, app, shell } from "electron";
import initIPC from "./ipc";
import appMenuTemplate from "./menu/appMenuTemplate";
import helpMenuTemplate from "./menu/helpMenuTemplate";
// import MenuManager from "./menuManager";
import WindowManager from "./windowManager";

const windowManager = new WindowManager();
// const menuManager = new MenuManager({ windowManager });

initIPC({ windowManager });

windowManager.start();
// console.log({ menuManager });

const openDocs = () => shell.openExternal("https://www.gbstudio.dev/docs/");
const openLearnMore = () => shell.openExternal("https://www.gbstudio.dev");

const setApplicationMenu = () => {
  const menus = [
    appMenuTemplate({
      openAbout: () => {},
      checkForUpdates: () => {},
      openPreferences: () => {},
    }),

    helpMenuTemplate({
      openDocs,
      openLearnMore,
    }),
  ];
  // if (env.name !== "production") {
  //   menus.push(devMenuTemplate);
  // }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

app.on("ready", () => {
  setApplicationMenu();
});

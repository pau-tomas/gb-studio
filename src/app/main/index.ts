// import { app, BrowserWindow, ipcMain, shell } from "electron";
import { Menu, app, shell } from "electron";
import initIPC from "./ipc";
import appMenuTemplate from "./menu/appMenuTemplate";
import editMenuTemplate from "./menu/editMenuTemplate";
import fileMenuTemplate from "./menu/fileMenuTemplate";
import gameMenuTemplate from "./menu/gameMenuTemplate";
import helpMenuTemplate from "./menu/helpMenuTemplate";
import viewMenuTemplate from "./menu/viewMenuTemplate";
import windowMenuTemplate from "./menu/windowMenuTemplate";
// import MenuManager from "./menuManager";
import WindowManager from "./windowManager";

const windowManager = new WindowManager();

const openDocs = () => shell.openExternal("https://www.gbstudio.dev/docs/");
const openLearnMore = () => shell.openExternal("https://www.gbstudio.dev");

const setApplicationMenu = () => {
  const isProjectOpen = () => false;
  const menus = [
    appMenuTemplate({
      openAbout: () => {},
      checkForUpdates: () => {},
      openPreferences: () => {},
    }),
    fileMenuTemplate({
      isProjectOpen,
      openNewProject: () => {},
      openProject: () => {},
      switchProject: () => {},
      saveProject: () => {},
      saveProjectAs: () => {},
      reloadAssets: () => {},
    }),
    editMenuTemplate({
      isProjectOpen,
      undo: () => {},
      redo: () => {},
      pasteInPlace: () => {},
    }),
    ...(isProjectOpen()
      ? [
          gameMenuTemplate({
            runGame: () => {},
            buildROM: () => {},
            buildWeb: () => {},
            buildPocket: () => {},
            ejectEngine: () => {},
            exportProjectSrc: () => {},
            exportProjectData: () => {},
          }),
        ]
      : []),
    viewMenuTemplate({
      isProjectOpen,
      setSection: () => {},
      getTheme: () => undefined,
      setTheme: () => {},
      getLocale: () => undefined,
      getLocales: () => [],
      setLocale: () => {},
      setShowCollisions: () => {},
      getShowConnections: () => undefined,
      setShowConnections: () => {},
      getShowNavigator: () => undefined,
      setShowNavigator: () => {},
      zoomIn: () => {},
      zoomOut: () => {},
      zoomReset: () => {},
    }),
    windowMenuTemplate({
      platform: process.platform,
    }),
    helpMenuTemplate({
      openDocs,
      openLearnMore,
    }),
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

app.on("ready", () => {
  windowManager.init();
  initIPC({ windowManager });
  setApplicationMenu();
});

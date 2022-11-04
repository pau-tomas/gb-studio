// import { app, BrowserWindow, ipcMain, shell } from "electron";
import { Menu, app, shell } from "electron";
import initElectronL10n from "lib/helpers/initElectronL10n";
import initIPC from "./ipc";
import appMenuTemplate from "./menu/appMenuTemplate";
import devMenuTemplate from "./menu/devMenuTemplate";
import editMenuTemplate from "./menu/editMenuTemplate";
import fileMenuTemplate from "./menu/fileMenuTemplate";
import gameMenuTemplate from "./menu/gameMenuTemplate";
import helpMenuTemplate from "./menu/helpMenuTemplate";
import viewMenuTemplate from "./menu/viewMenuTemplate";
import windowMenuTemplate from "./menu/windowMenuTemplate";
// import MenuManager from "./menuManager";
import WindowManager from "./windowManager";

const windowManager = new WindowManager();

const isDevMode = !!process.execPath.match(/[\\/]electron/);

const openDocs = () => shell.openExternal("https://www.gbstudio.dev/docs/");
const openLearnMore = () => shell.openExternal("https://www.gbstudio.dev");

const setApplicationMenu = (projectOpen: boolean) => {
  const isProjectOpen = () => projectOpen;
  const platform = process.platform;
  const menus = [
    ...(platform === "darwin"
      ? [
          appMenuTemplate({
            openAbout: () => {},
            checkForUpdates: () => {},
            openPreferences: () => {},
          }),
        ]
      : []),
    fileMenuTemplate({
      isProjectOpen,
      openNewProject: () => windowManager.openSplashWindow("new"),
      openProject: () => {},
      switchProject: () => windowManager.openSplashWindow("recent"),
      saveProject: () => {},
      saveProjectAs: () => {},
      reloadAssets: () => {},
    }),
    editMenuTemplate({
      platform,
      isProjectOpen,
      undo: () => {},
      redo: () => {},
      pasteInPlace: () => {},
      openPreferences: () => {},
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
    ...(isDevMode ? [devMenuTemplate] : []),
    windowMenuTemplate({
      platform,
    }),
    helpMenuTemplate({
      platform,
      openDocs,
      openLearnMore,
      openAbout: () => {},
      checkForUpdates: () => {},
    }),
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

app.on("ready", () => {
  initElectronL10n();
  windowManager.init({
    setApplicationMenu,
  });
  initIPC({ windowManager });
  setApplicationMenu(false);
});

// import { app, BrowserWindow, ipcMain, shell } from "electron";
import { Menu, app, shell, dialog, protocol } from "electron";
import open from "open";
import url from "url";
import initElectronL10n from "lib/helpers/initElectronL10n";
import { CreateProjectInput } from "lib/project/createProject";
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
import createProject from "lib/project/createProject";
import settings from "electron-settings";
import { isBoolean, isNumber, isString } from "@byte.london/byteguards";
import switchLanguageDialog from "lib/electron/dialog/switchLanguageDialog";
import ProjectManager from "./projectManager";
import Project from "./project";
import type { ProjectData } from "renderer/project/store/features/project/projectActions";
import { writeFileWithBackupAsync } from "lib/helpers/fs/writeFileWithBackup";
import { copy } from "fs-extra";
import path from "path";
import { writeFileAndFlushAsync } from "lib/helpers/fs/writeFileAndFlush";
import type { ShowConnectionsSetting } from "renderer/project/store/features/settings/settingsState";

const windowManager = new WindowManager(ProjectManager.getInstance());

const isDevMode = !!process.execPath.match(/[\\/]electron/);

const openDocs = () => shell.openExternal("https://www.gbstudio.dev/docs/");
const openLearnMore = () => shell.openExternal("https://www.gbstudio.dev");

const openPreferences = () => {
  windowManager.openPreferencesWindow();
};

const onOpenAbout = () => {
  windowManager.openAboutWindow();
};

const onOpenHelp = async (helpPage: string) => {
  if (helpPage === "sprites") {
    shell.openExternal("https://www.gbstudio.dev/docs/sprites/");
  } else if (helpPage === "backgrounds") {
    shell.openExternal("https://www.gbstudio.dev/docs/backgrounds/");
  } else if (helpPage === "ui-elements") {
    shell.openExternal("https://www.gbstudio.dev/docs/ui-elements/");
  } else if (helpPage === "music") {
    shell.openExternal("https://www.gbstudio.dev/docs/music/");
  } else if (helpPage === "error") {
    shell.openExternal("https://www.gbstudio.dev/docs/error/");
  }
};

const onOpenPlayWindow = async (url: string, sgbMode: boolean) => {
  windowManager.openPlayWindow(url, sgbMode);
};

const onCreateProject = async (
  input: CreateProjectInput,
  options?: {
    openOnSuccess?: boolean;
  }
): Promise<void> => {
  const projectDataPath = await createProject(input);
  if (options?.openOnSuccess) {
    await onOpenProject(projectDataPath);
  }
};

const onOpenProject = async (projectPath: string): Promise<void> => {
  const project = new Project(projectPath);
  await project.watch();
  windowManager.openProject(project);
  addRecentProject(projectPath);
};

const onSaveProject = async (
  projectPath: string,
  data: ProjectData
): Promise<void> => {
  await writeFileWithBackupAsync(projectPath, JSON.stringify(data, null, 4));
};

const onSaveProjectAs = async (
  projectPath: string,
  newProjectPath: string,
  data: ProjectData
): Promise<void> => {
  const oldAssetsDir = path.join(path.dirname(projectPath), "assets");
  const newAssetsDir = path.join(path.dirname(newProjectPath), "assets");
  if (oldAssetsDir !== newAssetsDir) {
    copy(oldAssetsDir, newAssetsDir);
  }
  await writeFileAndFlushAsync(newProjectPath, JSON.stringify(data, null, 4));
  addRecentProject(newProjectPath);
};

const onLoadedProject = async (data: ProjectData) => {
  const { showCollisions, showConnections, showNavigator } = data.settings;
  settings.set("showCollisions", showCollisions);
  settings.set("showConnections", showConnections);
  settings.set("showNavigator", showNavigator);
  setApplicationMenu();
};

const onSelectProjectToOpen = async () => {
  const files = dialog.showOpenDialogSync({
    properties: ["openFile"],
    filters: [
      {
        name: "Projects",
        extensions: ["gbsproj", "json"],
      },
    ],
  });
  if (files && files[0]) {
    onOpenProject(files[0]);
  }
};

const onOpenAsset = async (filePath: string, type: string) => {
  if (type === "image") {
    const app = String(settings.get("imageEditorPath") || "") || undefined;
    open(filePath, { app });
  } else if (type === "music") {
    const app = String(settings.get("musicEditorPath") || "") || undefined;
    open(filePath, { app });
  } else {
    shell.openPath(filePath);
  }
};

const onSetTheme = async (theme: string) => {
  await settings.set("theme", theme);
  windowManager.notifyThemeUpdate();
  setApplicationMenu();
};

const onResetTheme = async () => {
  await settings.delete("theme");
  windowManager.notifyThemeUpdate();
  setApplicationMenu();
};

const onSetLocale = async (locale: string) => {
  await settings.set("locale", locale);
  initElectronL10n();
  setApplicationMenu();
  switchLanguageDialog();
};

const onResetLocale = async () => {
  await settings.delete("locale");
  initElectronL10n();
  setApplicationMenu();
  switchLanguageDialog();
};

const onSetShowNavigator = async (showNavigator: boolean) => {
  await settings.set("showNavigator", showNavigator);
  setApplicationMenu();
};

const onSetUIScale = async (scale: number) => {
  await settings.set("zoomLevel", scale);
  windowManager.notifyUIScale(scale);
};

const onSetTrackerKeyBindings = async (value: number) => {
  await settings.set("trackerKeyBindings", value);
  windowManager.notifyTrackerKeyBindings(value);
};

const addRecentProject = async (projectPath: string) => {
  // Store recent projects
  await settings.set(
    "recentProjects",
    ([] as string[])
      .concat((settings.get("recentProjects") || []) as string[], projectPath)
      .reverse()
      .filter(
        (filename: string, index: number, arr: string[]) =>
          arr.indexOf(filename) === index
      ) // Only unique
      .reverse()
      .slice(-10)
  );
  app.addRecentDocument(projectPath);
};

const toShowConnectionsSetting = (value: unknown): ShowConnectionsSetting => {
  if (value === false || value === "all" || value === "selected") {
    return value;
  }
  return "selected";
};

const setApplicationMenu = async () => {
  const isProjectOpen = () => windowManager.isProjectWindowOpen();
  const platform = process.platform;
  const themeSetting = await settings.get("theme");
  const theme = isString(themeSetting) ? themeSetting : undefined;
  const localeSetting = await settings.get("locale");
  const locale = isString(localeSetting) ? localeSetting : undefined;
  const showCollisionsSetting = await settings.get("showCollisions");
  const showCollisions = isBoolean(showCollisionsSetting)
    ? showCollisionsSetting
    : undefined;
  const showConnectionsSetting = await settings.get("showConnections");
  const showConnections = toShowConnectionsSetting(showConnectionsSetting);
  const showNavigatorSetting = await settings.get("showNavigator");
  const showNavigator = isBoolean(showNavigatorSetting)
    ? showNavigatorSetting
    : undefined;

  const menus = [
    ...(platform === "darwin"
      ? [
          appMenuTemplate({
            openAbout: onOpenAbout,
            checkForUpdates: () => {},
            openPreferences,
          }),
        ]
      : []),
    fileMenuTemplate({
      isProjectOpen,
      openNewProject: () => windowManager.openSplashWindow("new"),
      openProject: onSelectProjectToOpen,
      switchProject: () => windowManager.openSplashWindow("recent"),
      saveProject: () => windowManager.requestSave(),
      saveProjectAs: () => windowManager.requestSave(true),
      reloadAssets: () => {},
    }),
    editMenuTemplate({
      platform,
      isProjectOpen,
      undo: () => windowManager.undo(),
      redo: () => windowManager.redo(),
      pasteInPlace: () => {},
      openPreferences,
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
      setSection: (section) => windowManager.setSection(section),
      theme,
      setTheme: onSetTheme,
      resetTheme: onResetTheme,
      locale,
      setLocale: onSetLocale,
      resetLocale: onResetLocale,
      setShowCollisions: (value) => {
        settings.set("showCollisions", value as boolean);
        windowManager.updateSetting("showCollisions", value ?? false);
      },
      getShowCollisions: () => showCollisions,
      getShowConnections: () => showConnections,
      setShowConnections: (value) => {
        settings.set("showConnections", value as string);
        windowManager.updateSetting("showConnections", value ?? "all");
        setApplicationMenu();
      },
      getShowNavigator: () => showNavigator,
      setShowNavigator: (value) => {
        settings.set("showNavigator", value as boolean);
        windowManager.updateSetting("showNavigator", value ?? false);
      },
      zoomIn: () => windowManager.zoomIn(),
      zoomOut: () => windowManager.zoomOut(),
      zoomReset: () => windowManager.zoomReset(),
    }),
    ...(isDevMode ? [devMenuTemplate] : []),
    windowMenuTemplate({
      platform,
    }),
    helpMenuTemplate({
      platform,
      openDocs,
      openLearnMore,
      openAbout: onOpenAbout,
      checkForUpdates: () => {},
    }),
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

protocol.registerSchemesAsPrivileged([
  { scheme: "atom", privileges: { bypassCSP: true } },
  { scheme: "file", privileges: { bypassCSP: true } },
]);

app.on("ready", async () => {
  const uiScaleSetting = await settings.get("zoomLevel");
  const uiScale = isNumber(uiScaleSetting) ? uiScaleSetting : 0;

  initElectronL10n();
  windowManager.init({
    setApplicationMenu,
    uiScale,
  });
  initIPC({
    projectManager: ProjectManager.getInstance(),
    windowManager,
    onCreateProject,
    onSelectProjectToOpen,
    onOpenProject,
    onSetUIScale,
    onSetTrackerKeyBindings,
    onOpenPlayWindow,
    onOpenHelp,
    onOpenAsset,
    onSaveProject,
    onSaveProjectAs,
    onLoadedProject,
    onSetShowNavigator,
  });
  setApplicationMenu();
  console.warn(
    "@TODO Use custom protocol to only allow reading files within current project rather than allowing file:// directly"
  );
  protocol.registerFileProtocol("atom", (request, callback) => {
    const filePath = url.fileURLToPath(
      "file://" + request.url.slice("atom://".length)
    );
    callback(filePath);
  });
});

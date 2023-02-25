import { createAsyncThunk, createAction, Dictionary } from "@reduxjs/toolkit";
import {
  Background,
  SpriteSheet,
  Music,
  EntitiesState,
  Font,
  Avatar,
  Emote,
  ProjectEntitiesData,
  BackgroundData,
  SpriteSheetData,
  MusicData,
  FontData,
  AvatarData,
  EmoteData,
  Sound,
} from "renderer/project/store/features/entities/entitiesTypes";
import type { RootState } from "renderer/project/store/configureStore";
// import loadProjectData from "lib/project/loadProjectData";
// import saveProjectData from "lib/project/saveProjectData";
// import saveAsProjectData from "lib/project/saveAsProjectData";
// import { loadSpriteData } from "lib/project/loadSpriteData";
// import { loadBackgroundData } from "lib/project/loadBackgroundData";
// import { loadMusicData } from "lib/project/loadMusicData";
// import { loadFontData } from "lib/project/loadFontData";
import { SettingsState } from "renderer/project/store/features/settings/settingsState";
import { MetadataState } from "renderer/project/store/features/metadata/metadataState";
import { parseAssetPath } from "shared/lib/assets/helpers";
import { denormalizeEntities } from "renderer/project/store/features/entities/entitiesHelpers";
import API from "renderer/lib/api";
import type { ScriptEventDef } from "lib/project/loadScriptEvents";
// import { loadAvatarData } from "lib/project/loadAvatarData";
// import { loadEmoteData } from "lib/project/loadEmoteData";
// import { loadSoundData } from "lib/project/loadSoundData";

let saving = false;

export type ProjectData = ProjectEntitiesData & {
  name: string;
  author: string;
  notes: string;
  _version: string;
  _release: string;
  settings: SettingsState;
};

export const denormalizeProject = (project: {
  entities: EntitiesState;
  settings: SettingsState;
  metadata: MetadataState;
}): ProjectData => {
  const entitiesData = denormalizeEntities(project.entities);
  return JSON.parse(
    JSON.stringify({
      ...project.metadata,
      ...entitiesData,
      settings: project.settings,
    })
  );
};

export const trimDenormalisedProject = (data: ProjectData): ProjectData => {
  return {
    ...data,
    backgrounds: data.backgrounds.map(
      (background) =>
        ({
          ...background,
          inode: undefined,
          _v: undefined,
        } as unknown as BackgroundData)
    ),
    spriteSheets: data.spriteSheets.map(
      (spriteSheet) =>
        ({
          ...spriteSheet,
          inode: undefined,
          _v: undefined,
        } as unknown as SpriteSheetData)
    ),
    music: data.music.map(
      (track) =>
        ({
          ...track,
          inode: undefined,
          _v: undefined,
        } as unknown as MusicData)
    ),
    fonts: data.fonts.map(
      (font) =>
        ({
          ...font,
          mapping: undefined,
          inode: undefined,
          _v: undefined,
        } as unknown as FontData)
    ),
    avatars: data.avatars.map(
      (avatar) =>
        ({
          ...avatar,
          inode: undefined,
          _v: undefined,
        } as unknown as AvatarData)
    ),
    emotes: data.emotes.map(
      (emote) =>
        ({
          ...emote,
          inode: undefined,
          _v: undefined,
        } as unknown as EmoteData)
    ),
  };
};

const openProject = createAction<string>("project/openProject");
const closeProject = createAction<void>("project/closeProject");

const loadProject = createAsyncThunk<{
  data: ProjectData;
  path: string;
  scriptEventDefs: Dictionary<ScriptEventDef>;
  modifiedSpriteIds: string[];
}>("project/loadProject", async () => {
  const { data, path, scriptEventDefs, modifiedSpriteIds } =
    (await API.project.loadProjectData()) as {
      data: ProjectData;
      path: string;
      scriptEventDefs: Dictionary<ScriptEventDef>;
      modifiedSpriteIds: string[];
    };

  return {
    data,
    path,
    scriptEventDefs,
    modifiedSpriteIds,
  };
});

/**************************************************************************
 * Backgrounds
 */

const loadBackground = createAsyncThunk<{ data: Background }, string>(
  "project/loadBackground",
  async (_filename, _thunkApi) => {
    // const state = thunkApi.getState() as RootState;

    // const projectRoot = state.document && state.document.root;
    // const data = (await loadBackgroundData(projectRoot)(filename)) as
    //   | Background
    //   | undefined;
    console.warn("Handle loadBackground");
    const data = undefined;

    if (!data) {
      throw new Error("Unable to load background");
    }

    return {
      data,
    };
  }
);

const removeBackground = createAsyncThunk<
  { filename: string; plugin?: string },
  string
>("project/removeBackground", async (filename, thunkApi) => {
  const state = thunkApi.getState() as RootState;
  const projectRoot = state.document && state.document.root;
  const { file, plugin } = parseAssetPath(filename, projectRoot, "backgrounds");
  return {
    filename: file,
    plugin,
  };
});

/**************************************************************************
 * Sprites
 */

const loadSprite = createAsyncThunk<{ data: SpriteSheet }, string>(
  "project/loadSprite",
  async (_filename, _thunkApi) => {
    // const state = thunkApi.getState() as RootState;

    // const projectRoot = state.document && state.document.root;
    // const data = (await loadSpriteData(projectRoot)(filename)) as
    //   | SpriteSheet
    //   | undefined;
    console.warn("Handle loadSprite");
    const data = undefined;

    if (!data) {
      throw new Error("Unable to load sprite sheet");
    }

    return {
      data,
    };
  }
);

const removeSprite = createAsyncThunk<
  { filename: string; plugin?: string },
  string
>("project/removeSprite", async (filename, thunkApi) => {
  const state = thunkApi.getState() as RootState;
  const projectRoot = state.document && state.document.root;
  const { file, plugin } = parseAssetPath(filename, projectRoot, "sprites");
  return {
    filename: file,
    plugin,
  };
});

/**************************************************************************
 * Music
 */

const loadMusic = createAsyncThunk<{ data: Music }, string>(
  "project/loadMusic",
  async (_filename, _thunkApi) => {
    // const state = thunkApi.getState() as RootState;

    // const projectRoot = state.document && state.document.root;
    // const data = (await loadMusicData(projectRoot)(filename)) as
    //   | Music
    //   | undefined;
    console.warn("Handle loadMusic");
    const data = undefined;

    if (!data) {
      throw new Error("Unable to load music");
    }

    return {
      data,
    };
  }
);

const removeMusic = createAsyncThunk<
  { filename: string; plugin?: string },
  string
>("project/removeMusic", async (filename, thunkApi) => {
  const state = thunkApi.getState() as RootState;
  const projectRoot = state.document && state.document.root;
  const { file, plugin } = parseAssetPath(filename, projectRoot, "music");
  return {
    filename: file,
    plugin,
  };
});

/**************************************************************************
 * Sound Effects
 */

const loadSound = createAsyncThunk<{ data: Sound }, string>(
  "project/loadSound",
  async (_filename, _thunkApi) => {
    // const state = thunkApi.getState() as RootState;

    // const projectRoot = state.document && state.document.root;
    // const data = (await loadSoundData(projectRoot)(filename)) as
    //   | Sound
    //   | undefined;
    console.warn("Handle loadSound");
    const data = undefined;

    if (!data) {
      throw new Error("Unable to load sound effect");
    }

    return {
      data,
    };
  }
);

const removeSound = createAsyncThunk<
  { filename: string; plugin?: string },
  string
>("project/removeSound", async (filename, thunkApi) => {
  const state = thunkApi.getState() as RootState;
  const projectRoot = state.document && state.document.root;
  const { file, plugin } = parseAssetPath(filename, projectRoot, "sounds");
  return {
    filename: file,
    plugin,
  };
});

/**************************************************************************
 * Fonts
 */

const loadFont = createAsyncThunk<{ data: Font }, string>(
  "project/loadFont",
  async (_filename, _thunkApi) => {
    // const state = thunkApi.getState() as RootState;

    // const projectRoot = state.document && state.document.root;
    // const data = (await loadFontData(projectRoot)(filename)) as
    //   | Font
    //   | undefined;
    console.warn("Handle loadFont");
    const data = undefined;

    if (!data) {
      throw new Error("Unable to load font");
    }

    return {
      data,
    };
  }
);

const removeFont = createAsyncThunk<
  { filename: string; plugin?: string },
  string
>("project/removeFont", async (filename, thunkApi) => {
  const state = thunkApi.getState() as RootState;
  const projectRoot = state.document && state.document.root;
  const { file, plugin } = parseAssetPath(filename, projectRoot, "fonts");
  return {
    filename: file,
    plugin,
  };
});

/**************************************************************************
 * Avatars
 */

const loadAvatar = createAsyncThunk<{ data: Avatar }, string>(
  "project/loadAvatar",
  async (_filename, _thunkApi) => {
    // const state = thunkApi.getState() as RootState;

    // const projectRoot = state.document && state.document.root;
    // const data = (await loadAvatarData(projectRoot)(filename)) as
    //   | Avatar
    //   | undefined;
    console.warn("Handle loadAvatar");
    const data = undefined;

    if (!data) {
      throw new Error("Unable to load avatar");
    }

    return {
      data,
    };
  }
);

const removeAvatar = createAsyncThunk<
  { filename: string; plugin?: string },
  string
>("project/removeAvatar", async (filename, thunkApi) => {
  const state = thunkApi.getState() as RootState;
  const projectRoot = state.document && state.document.root;
  const { file, plugin } = parseAssetPath(filename, projectRoot, "avatars");
  return {
    filename: file,
    plugin,
  };
});

/**************************************************************************
 * Emotes
 */

const loadEmote = createAsyncThunk<{ data: Emote }, string>(
  "project/loadEmote",
  async (_filename, _thunkApi) => {
    // const state = thunkApi.getState() as RootState;

    // const projectRoot = state.document && state.document.root;
    // const data = (await loadEmoteData(projectRoot)(filename)) as
    //   | Emote
    //   | undefined;
    console.warn("Handle loadEmote");
    const data = undefined;

    if (!data) {
      throw new Error("Unable to load emote");
    }

    return {
      data,
    };
  }
);

const removeEmote = createAsyncThunk<
  { filename: string; plugin?: string },
  string
>("project/removeEmote", async (filename, thunkApi) => {
  const state = thunkApi.getState() as RootState;
  const projectRoot = state.document && state.document.root;
  const { file, plugin } = parseAssetPath(filename, projectRoot, "emotes");
  return {
    filename: file,
    plugin,
  };
});

/**************************************************************************
 * UI
 */

const loadUI = createAction("project/loadUI");
const reloadAssets = createAction("project/reloadAssets");

/**************************************************************************
 * Asset Files
 */

const addFileToProject = createAction<string>("project/addFile");

/**************************************************************************
 * Save
 */

const saveProject = createAsyncThunk<string, boolean | undefined>(
  "project/saveProject",
  async (saveAs, thunkApi) => {
    const state = thunkApi.getState() as RootState;

    if (saving) {
      throw new Error("Cannot save project while already saving");
    }
    if (!state.document.loaded) {
      throw new Error("Cannot save project that has not finished loading");
    }
    if (!saveAs && !state.document.modified) {
      throw new Error("Cannot save unmodified project");
    }
    const normalizedProject = trimDenormalisedProject(
      denormalizeProject(state.project.present)
    );

    saving = true;
    let projectPath = "";

    try {
      const data: ProjectData = {
        ...normalizedProject,
        settings: {
          ...normalizedProject.settings,
          zoom: state.editor.zoom,
          worldScrollX: state.editor.worldScrollX,
          worldScrollY: state.editor.worldScrollY,
          navigatorSplitSizes: state.editor.navigatorSplitSizes,
        },
      };
      projectPath = await API.project.saveProjectData(data, saveAs);
    } catch (e) {
      console.error(e);
      saving = false;
      throw e;
    }
    saving = false;

    return projectPath;
  }
);

const projectActions = {
  openProject,
  closeProject,
  loadProject,
  loadBackground,
  removeBackground,
  loadSprite,
  removeSprite,
  loadMusic,
  removeMusic,
  loadSound,
  removeSound,
  loadFont,
  removeFont,
  loadAvatar,
  removeAvatar,
  loadEmote,
  removeEmote,
  loadUI,
  addFileToProject,
  reloadAssets,
  saveProject,
};

export default projectActions;

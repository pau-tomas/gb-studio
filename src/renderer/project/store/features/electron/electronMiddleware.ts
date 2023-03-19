import { EVENT_CALL_CUSTOM_EVENT } from "shared/lib/scripting/eventTypes";
import editorActions from "renderer/project/store/features/editor/editorActions";
import { getSettings } from "renderer/project/store/features/settings/settingsState";
import settingsActions from "renderer/project/store/features/settings/settingsActions";
import { Dispatch, Middleware } from "@reduxjs/toolkit";
import { RootState } from "renderer/project/store/configureStore";
import projectActions from "renderer/project/store/features/project/projectActions";
import {
  customEventSelectors,
  sceneSelectors,
  actorSelectors,
  triggerSelectors,
  scriptEventSelectors,
} from "renderer/project/store/features/entities/entitiesState";
import {
  ScriptEvent,
  ScriptEventParentType,
} from "renderer/project/store/features/entities/entitiesTypes";
import entitiesActions from "renderer/project/store/features/entities/entitiesActions";
import { uniq } from "lodash";
import actions from "./electronActions";
import API, { dialog, settings } from "renderer/lib/api";
import l10n from "shared/lib/l10n";
import {
  walkNormalisedActorEvents,
  walkNormalisedSceneSpecificEvents,
  walkNormalisedTriggerEvents,
} from "renderer/project/store/features/entities/entitiesHelpers";

const electronMiddleware: Middleware<Dispatch, RootState> =
  (store) => (next) => (action) => {
    if (actions.openHelp.match(action)) {
      API.app.openHelp(action.payload);
    } else if (actions.openFolder.match(action)) {
      API.project.openPath(action.payload);
    } else if (actions.openFile.match(action)) {
      API.project.openAsset(action.payload.filename, action.payload.type);
    } else if (editorActions.resizeWorldSidebar.match(action)) {
      settings.set("worldSidebarWidth", action.payload);
    } else if (editorActions.resizeFilesSidebar.match(action)) {
      settings.set("filesSidebarWidth", action.payload);
    } else if (editorActions.resizeNavigatorSidebar.match(action)) {
      settings.set("navigatorSidebarWidth", action.payload);
    } else if (
      editorActions.setTool.match(action) &&
      action.payload.tool === "colors"
    ) {
      const state = store.getState();
      const projectSettings = getSettings(state);
      if (!projectSettings.customColorsEnabled) {
        API.dialog.confirmEnableColorDialog().then((cancel) => {
          if (cancel) {
            return;
          }
          store.dispatch(
            settingsActions.editSettings({
              customColorsEnabled: true,
            })
          );
          store.dispatch(action);
        });
        return;
      }
    } else if (projectActions.loadProject.fulfilled.match(action)) {
      // ipcRenderer.send("project-loaded", action.payload.data.settings);
      console.warn("@TODO disabled project-loaded IPC call");
    } else if (settingsActions.setShowNavigator.match(action)) {
      API.project.setShowNavigator(action.payload);
    } else if (projectActions.loadProject.rejected.match(action)) {
      console.warn("@TODO disabled close project window on load project fail");
      // const window = remote.getCurrentWindow();
      // window.close();
    } else if (projectActions.closeProject.match(action)) {
      console.warn("@TODO disabled close project window on migration cancel");
      // const window = remote.getCurrentWindow();
      // window.close();
    } else if (entitiesActions.removeCustomEvent.match(action)) {
      const state = store.getState();
      const customEvent = customEventSelectors.selectById(
        state,
        action.payload.customEventId
      );

      if (!customEvent) {
        return;
      }

      const allCustomEvents = customEventSelectors.selectAll(state);
      const customEventIndex = allCustomEvents.indexOf(customEvent);
      const customEventName =
        customEvent.name || `${l10n("CUSTOM_EVENT")} ${customEventIndex + 1}`;
      const scenes = sceneSelectors.selectAll(state);
      const scenesLookup = sceneSelectors.selectEntities(state);
      const actorsLookup = actorSelectors.selectEntities(state);
      const eventsLookup = scriptEventSelectors.selectEntities(state);
      const triggersLookup = triggerSelectors.selectEntities(state);

      const usedSceneIds = [] as string[];
      const usedEvents = [] as {
        scriptEventId: string;
        entityId: string;
        type: ScriptEventParentType;
        key: string;
      }[];

      const isThisEvent = (event: ScriptEvent) =>
        event.command === EVENT_CALL_CUSTOM_EVENT &&
        event.args?.customEventId === action.payload.customEventId;

      const sceneName = (sceneId: string) => {
        const scene = scenesLookup[sceneId];
        const sceneIndex = scene ? scenes.indexOf(scene) : 0;
        return scene?.name || `${l10n("SCENE")} ${sceneIndex + 1}`;
      };

      // Check for uses of this custom event in project
      scenes.forEach((scene) => {
        walkNormalisedSceneSpecificEvents(
          scene,
          eventsLookup,
          {},
          (event, parent) => {
            if (isThisEvent(event) && parent) {
              usedEvents.push({
                scriptEventId: event.id,
                entityId: parent.id,
                type: parent.type,
                key: parent.key,
              });
              usedSceneIds.push(scene.id);
            }
          }
        );
        scene.actors.forEach((actorId) => {
          const actor = actorsLookup[actorId];
          actor &&
            walkNormalisedActorEvents(
              actor,
              eventsLookup,
              {},
              (event, parent) => {
                if (isThisEvent(event) && parent) {
                  usedEvents.push({
                    scriptEventId: event.id,
                    entityId: parent.id,
                    type: parent.type,
                    key: parent.key,
                  });
                  usedSceneIds.push(scene.id);
                }
              }
            );
        });
        scene.triggers.forEach((triggerId) => {
          const trigger = triggersLookup[triggerId];
          trigger &&
            walkNormalisedTriggerEvents(
              trigger,
              eventsLookup,
              {},
              (event, parent) => {
                if (isThisEvent(event) && parent) {
                  usedEvents.push({
                    scriptEventId: event.id,
                    entityId: parent.id,
                    type: parent.type,
                    key: parent.key,
                  });
                  usedSceneIds.push(scene.id);
                }
              }
            );
        });
      });

      const usedTotal = usedEvents.length;

      if (usedTotal > 0) {
        const sceneNames = uniq(
          usedSceneIds.map((sceneId) => sceneName(sceneId))
        ).sort();

        // Display confirmation and stop delete if cancelled
        API.dialog
          .confirmDeleteCustomEvent(customEventName, sceneNames, usedTotal)
          .then((cancel) => {
            if (cancel) {
              return;
            }
            // Remove any references to this custom event
            for (const usedEvent of usedEvents) {
              store.dispatch(entitiesActions.removeScriptEvent(usedEvent));
            }
          });
        return;
      }
    } else if (actions.showErrorBox.match(action)) {
      dialog.showError(action.payload.title, action.payload.content);
    }

    next(action);
  };

export default electronMiddleware;

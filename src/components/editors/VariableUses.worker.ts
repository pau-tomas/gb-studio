import { Dictionary } from "@reduxjs/toolkit";
import {
  actorName,
  customEventName,
  isUnionValue,
  sceneName,
  triggerName,
} from "shared/lib/entities/entitiesHelpers";
import {
  ActorNormalized,
  CustomEventNormalized,
  SceneNormalized,
  ScriptEventNormalized,
  TriggerNormalized,
} from "shared/lib/entities/entitiesTypes";
import { L10NLookup, setL10NData } from "shared/lib/lang/l10n";
import {
  ScriptEventDefs,
  isVariableField,
} from "shared/lib/scripts/scriptDefHelpers";
import {
  walkNormalizedCustomEventScripts,
  walkNormalizedScenesScripts,
} from "shared/lib/scripts/walk";

export type VariableUse = {
  id: string;
  name: string;
  event: ScriptEventNormalized;
} & (
  | {
      type: "scene";
      sceneId: string;
      scene: SceneNormalized;
      sceneIndex: number;
    }
  | {
      type: "actor";
      actor: ActorNormalized;
      actorIndex: number;
      sceneId: string;
      scene: SceneNormalized;
      sceneIndex: number;
    }
  | {
      type: "trigger";
      trigger: TriggerNormalized;
      triggerIndex: number;
      sceneId: string;
      scene: SceneNormalized;
      sceneIndex: number;
    }
  | {
      type: "custom";
      customEvent: CustomEventNormalized;
      customEventIndex: number;
    }
);

export interface VariableUseResult {
  id: string;
  uses: VariableUse[];
}

// eslint-disable-next-line no-restricted-globals
const workerCtx: Worker = self as unknown as Worker;

workerCtx.onmessage = async (evt) => {
  const id = evt.data.id;
  const variableId: string = evt.data.variableId;
  const scenes: SceneNormalized[] = evt.data.scenes;
  const scriptEventsLookup: Dictionary<ScriptEventNormalized> =
    evt.data.scriptEventsLookup;
  const actorsLookup: Dictionary<ActorNormalized> = evt.data.actorsLookup;
  const triggersLookup: Dictionary<TriggerNormalized> = evt.data.triggersLookup;
  const scriptEventDefs: ScriptEventDefs = evt.data.scriptEventDefs;
  const customEventsLookup: Dictionary<CustomEventNormalized> =
    evt.data.customEventsLookup;
  const l10NData: L10NLookup = evt.data.l10NData;

  console.log(customEventsLookup);

  setL10NData(l10NData);

  const uses: VariableUse[] = [];
  const useLookup: Dictionary<boolean> = {};

  walkNormalizedScenesScripts(
    scenes,
    scriptEventsLookup,
    actorsLookup,
    triggersLookup,
    undefined,
    (scriptEvent, scene, actor, trigger) => {
      if (!scriptEvent.args) {
        return;
      }
      for (const arg in scriptEvent.args) {
        if (
          !isVariableField(
            scriptEvent.command,
            arg,
            scriptEvent.args,
            scriptEventDefs
          )
        ) {
          continue;
        }

        const argValue = scriptEvent.args[arg];
        const isVariableId =
          argValue === variableId ||
          (isUnionValue(argValue) &&
            argValue.type === "variable" &&
            argValue.value === variableId);

        if (!isVariableId) {
          continue;
        }

        if (!useLookup[scene.id]) {
          const sceneIndex = scenes.indexOf(scene);
          uses.push({
            id: scene.id,
            name: sceneName(scene, sceneIndex),
            event: scriptEvent,
            type: "scene",
            scene,
            sceneIndex,
            sceneId: scene.id,
          });
          useLookup[scene.id] = true;
        }

        if (actor && !useLookup[actor.id]) {
          const sceneIndex = scenes.indexOf(scene);
          const actorIndex = scene.actors.indexOf(actor.id);
          uses.push({
            id: actor.id,
            name: actorName(actor, actorIndex),
            event: scriptEvent,
            type: "actor",
            actor,
            actorIndex,
            scene,
            sceneIndex,
            sceneId: scene.id,
          });
          useLookup[actor.id] = true;
        }

        if (trigger && !useLookup[trigger.id]) {
          const sceneIndex = scenes.indexOf(scene);
          const triggerIndex = scene.triggers.indexOf(trigger.id);
          uses.push({
            id: trigger.id,
            name: triggerName(trigger, triggerIndex),
            event: scriptEvent,
            type: "trigger",
            trigger,
            triggerIndex,
            scene,
            sceneIndex,
            sceneId: scene.id,
          });
          useLookup[trigger.id] = true;
        }
      }
    }
  );

  Object.values(customEventsLookup).forEach((customEvent, customEventIndex) => {
    if (!customEvent) return;
    walkNormalizedCustomEventScripts(
      customEvent,
      scriptEventsLookup,
      undefined,
      (scriptEvent: ScriptEventNormalized) => {
        for (const arg in scriptEvent.args) {
          if (
            !isVariableField(
              scriptEvent.command,
              arg,
              scriptEvent.args,
              scriptEventDefs
            )
          ) {
            continue;
          }

          const argValue = scriptEvent.args[arg];
          const isVariableId =
            argValue === variableId ||
            (isUnionValue(argValue) &&
              argValue.type === "variable" &&
              argValue.value === variableId);

          if (!isVariableId) {
            continue;
          }

          if (!useLookup[customEvent.id])
            uses.push({
              id: customEvent.id,
              name: customEventName(customEvent, customEventIndex),
              event: scriptEvent,
              type: "custom",
              customEvent,
              customEventIndex: customEventIndex,
            });
          useLookup[customEvent.id] = true;
        }
      }
    );
  });

  workerCtx.postMessage({ id, uses } as VariableUseResult);
};

// -----------------------------------------------------------------

export default class W extends Worker {
  constructor() {
    super("");
  }
}

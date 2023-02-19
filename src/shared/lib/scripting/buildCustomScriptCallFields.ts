import { Dictionary } from "@reduxjs/toolkit";
import type { ScriptEventDef } from "lib/project/loadScriptEvents";
import type { EngineFieldSchema } from "renderer/project/store/features/engine/engineState";
import type {
  CustomEvent,
  ScriptEventFieldSchema,
} from "renderer/project/store/features/entities/entitiesTypes";

const buildCustomScriptCallFields = (
  command: string,
  value: { customEventId?: string },
  customEvents: Dictionary<CustomEvent>,
  _engineFields: EngineFieldSchema[],
  scriptEventDefsLookup: Dictionary<ScriptEventDef>
): ScriptEventFieldSchema[] => {
  const eventCommands =
    (scriptEventDefsLookup[command] &&
      scriptEventDefsLookup[command]?.fields) ||
    [];
  if (value.customEventId && customEvents[value.customEventId]) {
    const customEvent = customEvents[value.customEventId];
    const description = customEvent?.description
      ? [
          {
            label: customEvent.description,
          },
          {
            type: "break",
          },
        ]
      : [];
    const usedVariables =
      Object.values(customEvent?.variables || []).map((v) => {
        return {
          label: `${v?.name || ""}`,
          key: `$variable[${v?.id || ""}]$`,
          type: "union",
          types: ["number", "variable"],
          defaultType: "variable",
          min: -32768,
          max: 32767,
          defaultValue: {
            number: 0,
            variable: "LAST_VARIABLE",
          },
        };
      }) || [];
    const usedActors =
      Object.values(customEvent?.actors || []).map((a) => {
        return {
          label: `${a?.name || ""}`,
          defaultValue: "player",
          key: `$actor[${a?.id || ""}]$`,
          type: "actor",
        };
      }) || [];
    return ([] as ScriptEventFieldSchema[]).concat(
      eventCommands,
      description,
      usedVariables,
      usedActors
    );
  }
  return [];
};

export default buildCustomScriptCallFields;

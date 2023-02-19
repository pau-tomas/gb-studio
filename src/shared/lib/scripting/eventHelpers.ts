import { Dictionary } from "@reduxjs/toolkit";
import type { ScriptEventDef } from "lib/project/loadScriptEvents";
import type {
  ScriptEventFieldCondition,
  ScriptEventFieldSchema,
  UnionValue,
} from "renderer/project/store/features/entities/entitiesTypes";
import {
  EVENT_ENGINE_FIELD_SET,
  EVENT_ENGINE_FIELD_STORE,
  EVENT_FADE_IN,
  ScriptEventData,
} from "./eventTypes";

export interface ScriptEventsDefLookups {
  eventsLookup: Dictionary<ScriptEventDef>;
  engineFieldUpdateEventsLookup: Dictionary<ScriptEventDef>;
  engineFieldStoreEventsLookup: Dictionary<ScriptEventDef>;
}

export const calculateAutoFadeEventId = <T>(
  script: T[],
  getScriptData: (item: T) => ScriptEventData | undefined,
  makeWalker: (
    script: T[],
    filter: (item: T) => boolean
  ) => Generator<ScriptEventData>,
  scriptEventsLookup: Dictionary<ScriptEventDef>
): string => {
  for (const scriptItem of script) {
    const scriptEvent = getScriptData(scriptItem);
    if (!scriptEvent) {
      continue;
    }
    if (scriptEvent.args?.__comment) {
      continue;
    }
    if (scriptEvent.command === EVENT_FADE_IN) {
      return "MANUAL";
    }
    const walker = makeWalker([scriptItem], (item) => {
      const childEvent = getScriptData(item);
      if (!childEvent || childEvent?.args?.__comment) {
        return false;
      }
      if (scriptEventsLookup[childEvent.command]?.allowChildrenBeforeInitFade) {
        return false;
      }
      return true;
    });

    for (const childEvent of walker) {
      if (scriptEventsLookup[childEvent.command]?.waitUntilAfterInitFade) {
        if (childEvent.command === EVENT_FADE_IN) {
          return "MANUAL";
        } else {
          return scriptEvent.id;
        }
      }
    }
  }
  return "";
};

const getField = (
  cmd: string,
  fieldName: string,
  args: Record<string, unknown>,
  lookup: ScriptEventsDefLookups
): ScriptEventFieldSchema | undefined => {
  const {
    eventsLookup: events,
    engineFieldUpdateEventsLookup,
    engineFieldStoreEventsLookup,
  } = lookup;

  let event = events[cmd];

  if (
    cmd === EVENT_ENGINE_FIELD_SET &&
    args.engineFieldKey &&
    typeof args.engineFieldKey === "string" &&
    engineFieldUpdateEventsLookup[args.engineFieldKey]
  ) {
    event = engineFieldUpdateEventsLookup[args.engineFieldKey];
  } else if (
    cmd === EVENT_ENGINE_FIELD_STORE &&
    args.engineFieldKey &&
    typeof args.engineFieldKey === "string" &&
    engineFieldStoreEventsLookup[args.engineFieldKey]
  ) {
    event = engineFieldStoreEventsLookup[args.engineFieldKey];
  }

  if (!event) return undefined;

  const findFieldRecursive = (
    fields: ScriptEventFieldSchema[]
  ): ScriptEventFieldSchema | undefined => {
    for (const field of fields) {
      if (field.key === fieldName) {
        return field;
      }
      if (field.type === "group" && field.fields) {
        const childField = findFieldRecursive(field.fields);
        if (childField) {
          return childField;
        }
      }
    }
  };

  return findFieldRecursive(event.fields);
};

const isUnionValue = (value: unknown): value is UnionValue => {
  return !!value && typeof value === "object" && "type" in value;
};

export const isVariableField = (
  cmd: string,
  fieldName: string,
  args: Record<string, unknown>,
  lookup: ScriptEventsDefLookups
) => {
  if (fieldName.startsWith("$variable[")) {
    return true;
  }
  const field = getField(cmd, fieldName, args, lookup);
  const argValue = args[fieldName];
  return (
    field &&
    (field.type === "variable" ||
      (field.type === "union" &&
        isUnionValue(argValue) &&
        argValue.type === "variable")) &&
    isFieldVisible(field, args)
  );
};

const isFieldVisible = (
  field: ScriptEventFieldSchema,
  args: Record<string, unknown>
) => {
  if (!field.conditions) {
    return true;
  }
  // Determine if field conditions are met
  return field.conditions.reduce(
    (memo: boolean, condition: ScriptEventFieldCondition) => {
      const keyValue = args[condition.key];
      return (
        memo &&
        (!condition.eq || keyValue === condition.eq) &&
        (!condition.ne || keyValue !== condition.ne) &&
        (!condition.gt || Number(keyValue) > Number(condition.gt)) &&
        (!condition.gte || Number(keyValue) >= Number(condition.gte)) &&
        (!condition.lt || Number(keyValue) > Number(condition.lt)) &&
        (!condition.lte || Number(keyValue) >= Number(condition.lte)) &&
        (!condition.in || condition.in.indexOf(keyValue) >= 0)
      );
    },
    true
  );
};

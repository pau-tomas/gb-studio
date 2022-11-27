import { EVENT_FADE_IN, ScriptEventData } from "./eventTypes";

export const calculateAutoFadeEventId = <T>(
  script: T[],
  getScriptData: (item: T) => ScriptEventData | undefined,
  makeWalker: (
    script: T[],
    filter: (item: T) => boolean
  ) => Generator<ScriptEventData>
): string => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const events = require("lib/events").default;
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
      if (events[childEvent.command]?.allowChildrenBeforeInitFade) {
        return false;
      }
      return true;
    });

    for (const childEvent of walker) {
      if (events[childEvent.command]?.waitUntilAfterInitFade) {
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

import { Dictionary } from "@reduxjs/toolkit";
import type { EventHandler } from "lib/events";
import mapValues from "lodash/mapValues";
import type {
  ActorDenormalized,
  SceneDenormalized,
  ScriptEventDenormalized,
  TriggerDenormalized,
} from "renderer/project/store/features/entities/entitiesTypes";

export interface EventLookup {
  eventsLookup: Dictionary<EventHandler>;
  engineFieldUpdateEventsLookup: Dictionary<EventHandler>;
  engineFieldStoreEventsLookup: Dictionary<EventHandler>;
}

type ScriptEventDenormalizedMapFn = (
  event: ScriptEventDenormalized
) => ScriptEventDenormalized;

type ScriptEventDenormalizedWalkFn = (event: ScriptEventDenormalized) => void;

type ScriptEventDenormalizedFilterFn = (
  event: ScriptEventDenormalized
) => boolean;

const mapEvents = (
  events: ScriptEventDenormalized[] = [],
  callback: (e: ScriptEventDenormalized) => ScriptEventDenormalized
) => {
  return events.map((event): ScriptEventDenormalized => {
    if (event && event.children) {
      const newEvent = callback(event);
      return {
        ...newEvent,
        children: mapValues(
          newEvent.children || event.children,
          (childEvents) => mapEvents(childEvents, callback)
        ),
      };
    }
    if (!event) {
      return event;
    }
    return callback(event);
  });
};

const mapSceneEvents = (
  scene: SceneDenormalized,
  callback: ScriptEventDenormalizedMapFn
) => {
  return {
    ...scene,
    script: mapEvents(scene.script, callback),
    playerHit1Script: mapEvents(scene.playerHit1Script, callback),
    playerHit2Script: mapEvents(scene.playerHit2Script, callback),
    playerHit3Script: mapEvents(scene.playerHit3Script, callback),
    actors: scene.actors.map((actor) => {
      return {
        ...actor,
        script: mapEvents(actor.script, callback),
        startScript: mapEvents(actor.startScript, callback),
        updateScript: mapEvents(actor.updateScript, callback),
        hit1Script: mapEvents(actor.hit1Script, callback),
        hit2Script: mapEvents(actor.hit2Script, callback),
        hit3Script: mapEvents(actor.hit3Script, callback),
      };
    }),
    triggers: scene.triggers.map((trigger) => {
      return {
        ...trigger,
        script: mapEvents(trigger.script, callback),
        leaveScript: mapEvents(trigger.leaveScript, callback),
      };
    }),
  };
};

const mapScenesEvents = (
  scenes: SceneDenormalized[],
  callback: ScriptEventDenormalizedMapFn
) => {
  return scenes.map((scene) => {
    return mapSceneEvents(scene, callback);
  });
};

const walkEvents = (
  events: ScriptEventDenormalized[] = [],
  callback: ScriptEventDenormalizedWalkFn
) => {
  for (let i = 0; i < events.length; i++) {
    callback(events[i]);
    const children = events[i].children;
    if (children) {
      Object.keys(children).forEach((key) => {
        walkEvents(children[key], callback);
      });
    }
  }
};

const walkEventsDepthFirst = (
  events: ScriptEventDenormalized[] = [],
  callback: ScriptEventDenormalizedWalkFn
) => {
  for (let i = 0; i < events.length; i++) {
    const children = events[i].children;
    if (children) {
      Object.keys(children).forEach((key) => {
        walkEvents(children[key], callback);
      });
    }
    callback(events[i]);
  }
};

const walkSceneSpecificEvents = (
  scene: SceneDenormalized,
  callback: ScriptEventDenormalizedWalkFn
) => {
  walkEvents(scene.script, callback);
  walkEvents(scene.playerHit1Script, callback);
  walkEvents(scene.playerHit2Script, callback);
  walkEvents(scene.playerHit3Script, callback);
};

const walkActorEvents = (
  actor: ActorDenormalized,
  callback: ScriptEventDenormalizedWalkFn
) => {
  walkEvents(actor.script, callback);
  walkEvents(actor.startScript, callback);
  walkEvents(actor.updateScript, callback);
  walkEvents(actor.hit1Script, callback);
  walkEvents(actor.hit2Script, callback);
  walkEvents(actor.hit3Script, callback);
};

const walkTriggerEvents = (
  trigger: TriggerDenormalized,
  callback: ScriptEventDenormalizedWalkFn
) => {
  walkEvents(trigger.script, callback);
  walkEvents(trigger.leaveScript, callback);
};

const walkSceneEvents = (
  scene: SceneDenormalized,
  callback: ScriptEventDenormalizedWalkFn
) => {
  walkSceneSpecificEvents(scene, callback);
  scene.actors.forEach((actor) => {
    walkActorEvents(actor, callback);
  });
  scene.triggers.forEach((trigger) => {
    walkEvents(trigger.script, callback);
  });
};

const walkScenesEvents = (
  scenes: SceneDenormalized[],
  callback: ScriptEventDenormalizedWalkFn
) => {
  scenes.forEach((scene) => {
    walkSceneEvents(scene, callback);
  });
};

const filterEvents = (
  data: ScriptEventDenormalized[] = [],
  fn: ScriptEventDenormalizedFilterFn
) => {
  return data.reduce((memo, o) => {
    if (fn(o)) {
      memo.push({
        ...o,
        children:
          o.children &&
          mapValues(o.children, (childEvents) => filterEvents(childEvents, fn)),
      });
    }
    return memo;
  }, [] as ScriptEventDenormalized[]);
};

const filterSceneEvents = (
  scene: SceneDenormalized,
  callback: ScriptEventDenormalizedFilterFn
) => {
  return {
    ...scene,
    script: filterEvents(scene.script, callback),
    playerHit1Script: filterEvents(scene.playerHit1Script, callback),
    playerHit2Script: filterEvents(scene.playerHit2Script, callback),
    playerHit3Script: filterEvents(scene.playerHit3Script, callback),
    actors: scene.actors.map((actor) => {
      return {
        ...actor,
        script: filterEvents(actor.script, callback),
        startScript: filterEvents(actor.startScript, callback),
        updateScript: filterEvents(actor.updateScript, callback),
        hit1Script: filterEvents(actor.hit1Script, callback),
        hit2Script: filterEvents(actor.hit2Script, callback),
        hit3Script: filterEvents(actor.hit3Script, callback),
      };
    }),
    triggers: scene.triggers.map((trigger) => {
      return {
        ...trigger,
        script: filterEvents(trigger.script, callback),
      };
    }),
  };
};

const filterScenesEvents = (
  scenes: SceneDenormalized[],
  callback: ScriptEventDenormalizedFilterFn
) => {
  return scenes.map((scene) => {
    return filterSceneEvents(scene, callback);
  });
};

const eventHasArg = (event: ScriptEventDenormalized, argName: string) => {
  return (
    event.args && Object.prototype.hasOwnProperty.call(event.args, argName)
  );
};

export {
  mapEvents,
  mapScenesEvents,
  mapSceneEvents,
  walkEvents,
  walkEventsDepthFirst,
  walkScenesEvents,
  walkSceneEvents,
  walkSceneSpecificEvents,
  walkActorEvents,
  walkTriggerEvents,
  filterEvents,
  filterScenesEvents,
  filterSceneEvents,
  eventHasArg,
};

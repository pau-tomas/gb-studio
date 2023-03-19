import { Dispatch, Middleware } from "@reduxjs/toolkit";
import { RootState } from "renderer/project/store/configureStore";
import { selectScriptEventDefsLookups } from "renderer/project/store/features/scriptEventDefs/scriptEventDefsState";
import entitiesActions from "./entitiesActions";

const entitiesMiddleware: Middleware<Dispatch, RootState> =
  (store) => (next) => (action) => {
    next(action);

    if (
      entitiesActions.editScriptEvent.match(action) ||
      entitiesActions.editScriptEventArg.match(action) ||
      entitiesActions.removeScriptEvent.match(action) ||
      entitiesActions.addScriptEvents.match(action)
    ) {
      const state = store.getState();
      const editorType = state.editor.type;
      const entityId = state.editor.entityId;
      const scriptEventsDefLookups = selectScriptEventDefsLookups(state);
      if (editorType === "customEvent") {
        store.dispatch(
          entitiesActions.refreshCustomEventArgs({
            customEventId: entityId,
            scriptEventsDefLookups,
          })
        );
      }
    }
  };

export default entitiesMiddleware;

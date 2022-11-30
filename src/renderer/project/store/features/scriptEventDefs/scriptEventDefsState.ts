import { createSlice, Dictionary } from "@reduxjs/toolkit";
import type { ScriptEventDef } from "lib/project/loadScriptEvents";
import projectActions from "renderer/project/store/features/project/projectActions";
import { RootState } from "renderer/project/store/configureStore";

export interface ScriptEventsState {
  eventsLookup: Dictionary<ScriptEventDef>;
  engineFieldUpdateEventsLookup: Dictionary<ScriptEventDef>;
  engineFieldStoreEventsLookup: Dictionary<ScriptEventDef>;
  loaded: boolean;
}

export const initialState: ScriptEventsState = {
  eventsLookup: {},
  engineFieldUpdateEventsLookup: {},
  engineFieldStoreEventsLookup: {},
  loaded: false,
};

const scriptEventDefsSlice = createSlice({
  name: "scriptEventDefs",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(projectActions.loadProject.pending, (state, _action) => {
        state.loaded = false;
      })
      .addCase(projectActions.loadProject.fulfilled, (state, action) => {
        state.eventsLookup = action.payload.scriptEventDefs;
        state.loaded = true;
      }),
});

const { reducer } = scriptEventDefsSlice;

export const selectScriptEventDefsLookup = (state: RootState) =>
  state.scriptEventDefs.eventsLookup;

export default reducer;

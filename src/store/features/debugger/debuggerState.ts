import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ScriptMapItem {
  script: string[];
  entityId: string;
  entityType: string;
  scriptType: string;
}

export interface DebuggerState {
  memoryMap: { [key: string]: string };
  globalVariables: { [key: string]: string };
  memoryDict: Map<number, Map<number, string>>;
  scriptMap: { [key: string]: ScriptMapItem };
}

export const initialState: DebuggerState = {
  memoryMap: {},
  globalVariables: {},
  memoryDict: new Map(),
  scriptMap: {},
};

const debuggerSlice = createSlice({
  name: "debug",
  initialState,
  reducers: {
    setMemoryMap: (state, action: PayloadAction<{ [key: string]: string }>) => {
      state.memoryMap = action.payload;
    },
    setMemoryDict: (
      state,
      action: PayloadAction<Map<number, Map<number, string>>>
    ) => {
      state.memoryDict = action.payload;
    },
    setGlobalVariables: (
      state,
      action: PayloadAction<{ [key: string]: string }>
    ) => {
      state.globalVariables = action.payload;
    },
    setScriptMap: (
      state,
      action: PayloadAction<{ [key: string]: ScriptMapItem }>
    ) => {
      state.scriptMap = action.payload;
    },
  },
});

export const { actions, reducer } = debuggerSlice;

export default reducer;

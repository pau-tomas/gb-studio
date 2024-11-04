import {
  PayloadAction,
  CaseReducer,
  SliceCaseReducers,
} from "@reduxjs/toolkit";
import { EntitiesState } from "shared/lib/entities/entitiesTypes";
import { genEntitySymbol } from "shared/lib/entities/entitiesHelpers";
import { variablesAdapter } from "store/features/entities/adapters";
import { localVariableSelectById } from "store/features/entities/helpers";

const renameVariable: CaseReducer<
  EntitiesState,
  PayloadAction<{ variableId: string; name: string }>
> = (state, action) => {
  const variable = localVariableSelectById(state, action.payload.variableId);
  const existingVariable = state.variables.entities[action.payload.variableId];
  const existingHasFlags =
    existingVariable?.flags && Object.keys(existingVariable.flags).length > 0;
  if (action.payload.name.length > 0 || existingHasFlags) {
    variablesAdapter.upsertOne(state.variables, {
      id: action.payload.variableId,
      name: action.payload.name,
      isArray: false,
      size: 1,
      symbol:
        action.payload.name.length > 0
          ? genEntitySymbol(state, `var_${action.payload.name}`)
          : "",
    });
  } else if (variable && !variable.isArray) {
    variablesAdapter.removeOne(state.variables, action.payload.variableId);
  } else {
    // Variable is being set with empty name and doesn't have flags
    // set so can safely remove it
    variablesAdapter.removeOne(state.variables, action.payload.variableId);
  }
};

const renameVariableFlags: CaseReducer<
  EntitiesState,
  PayloadAction<{ variableId: string; flags: Record<string, string> }>
> = (state, action) => {
  const existingVariable = state.variables.entities[action.payload.variableId];
  const numFlags = Object.values(action.payload.flags).length;
  const existingHasName =
    existingVariable?.name && existingVariable?.name.length > 0;
  if (numFlags > 0 || existingHasName) {
    variablesAdapter.upsertOne(state.variables, {
      id: action.payload.variableId,
      name: existingVariable?.name ?? "",
      symbol: existingVariable?.symbol ?? "",
      isArray: existingVariable?.isArray ?? false,
      size: existingVariable?.size ?? 1,
      flags: action.payload.flags,
    });
  } else {
    // Variable is being set with empty flags and doesn't have name
    // set so can safely remove it
    variablesAdapter.removeOne(state.variables, action.payload.variableId);
  }
};

const variablesReducers = {
  renameVariable,
  renameVariableFlags,
} satisfies SliceCaseReducers<EntitiesState>;

export default variablesReducers;

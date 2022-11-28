import type { ScriptEditorContextType } from "shared/lib/scripting/context";
import l10n from "shared/lib/l10n";
import uniq from "lodash/uniq";
import type {
  CustomEvent,
  Variable,
} from "renderer/project/store/features/entities/entitiesTypes";
import {
  allVariables,
  customEventVariableCode,
  customEventVariableName,
  customEventVariables,
  globalVariableCode,
  globalVariableName,
  localVariableCode,
  localVariableName,
  localVariables,
  tempVariableCode,
  tempVariableName,
  tempVariables,
} from "shared/lib/variables/variableNames";

type VariablesLookup = { [name: string]: Variable | undefined };

export interface NamedVariable {
  id: string; // The id to use in dropdown value
  code: string; // The code to use in dialogue (when wrapped by $ or #)
  name: string; // The user defined name or default when not named
  group: string; // Group name that variable belongs to
}

export interface VariableGroup {
  name: string; // The group name
  variables: NamedVariable[]; // Variables in the group
}

/******************************************************************************
 * Available Variables List (for using in Dropdowns etc)
 */

export const namedVariablesByContext = (
  context: ScriptEditorContextType,
  entityId: string,
  variablesLookup: VariablesLookup,
  customEvent: CustomEvent | undefined
): NamedVariable[] => {
  if (context === "script") {
    if (customEvent) {
      return namedCustomEventVariables(customEvent, variablesLookup);
    }
    return [];
  } else if (context === "entity") {
    return namedEntityVariables(entityId, variablesLookup);
  } else {
    return namedGlobalVariables(variablesLookup);
  }
};

export const namedCustomEventVariables = (
  customEvent: CustomEvent,
  variablesLookup: VariablesLookup
): NamedVariable[] => {
  return ([] as NamedVariable[]).concat(
    customEventVariables.map((variable) => ({
      id: customEventVariableCode(variable),
      code: customEventVariableCode(variable),
      name: customEventVariableName(variable, customEvent),
      group: l10n("SIDEBAR_PARAMETERS"),
    })),
    allVariables.map((variable) => ({
      id: variable,
      code: globalVariableCode(variable),
      name: globalVariableName(variable, variablesLookup),
      group: l10n("FIELD_GLOBAL"),
    }))
  );
};

export const namedEntityVariables = (
  entityId: string,
  variablesLookup: VariablesLookup
): NamedVariable[] => {
  return ([] as NamedVariable[]).concat(
    localVariables.map((variable) => ({
      id: localVariableCode(variable),
      code: localVariableCode(variable),
      name: localVariableName(variable, entityId, variablesLookup),
      group: l10n("FIELD_LOCAL"),
    })),
    tempVariables.map((variable) => ({
      id: tempVariableCode(variable),
      code: tempVariableCode(variable),
      name: tempVariableName(variable),
      group: l10n("FIELD_TEMPORARY"),
    })),
    allVariables.map((variable) => ({
      id: variable,
      code: globalVariableCode(variable),
      name: globalVariableName(variable, variablesLookup),
      group: l10n("FIELD_GLOBAL"),
    }))
  );
};

export const namedGlobalVariables = (
  variablesLookup: VariablesLookup
): NamedVariable[] => {
  return ([] as NamedVariable[]).concat(
    allVariables.map((variable) => ({
      id: variable,
      code: globalVariableCode(variable),
      name: globalVariableName(variable, variablesLookup),
      group: l10n("FIELD_GLOBAL"),
    }))
  );
};

export const groupVariables = (variables: NamedVariable[]): VariableGroup[] => {
  const groups = uniq(variables.map((f) => f.group));
  return groups.map((g) => {
    const groupVariables = variables.filter((f) => f.group === g);
    return {
      name: g,
      variables: groupVariables,
    };
  });
};

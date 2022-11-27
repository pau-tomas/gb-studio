import React from "react";
import { ScriptEditorContextType } from "shared/lib/scripting/context";

export const ScriptEditorContext =
  React.createContext<ScriptEditorContextType>("entity");

// import { defaultKeys, milkytrackerKeys, openMPTKeys } from "./defaultKeys";
// import settings from "electron-settings";

interface KeyCommands {
  editNoteField?: (...args: (number | null)[]) => void;
  editInstrumentField?: (...args: (number | null)[]) => void;
  editEffectCodeField?: (...args: (number | null)[]) => void;
  editEffectParamField?: (...args: (number | null)[]) => void;
}

export type KeyWhen =
  | null
  | "noteColumnFocus"
  | "instrumentColumnFocus"
  | "effectCodeColumnFocus"
  | "effectParamColumnFocus";

export interface KeyBinding {
  key: string;
  command: keyof KeyCommands;
  args: number | null;
  when: KeyWhen;
}

const keyBindings: KeyBinding[] = [];

export const getKeys = (key: string, when: KeyWhen, cmds: KeyCommands) => {
  const pressedKey = keyBindings
    .reverse()
    .filter((k) => k.key === key && k.when === when)[0];

  if (pressedKey) {
    const command = cmds[pressedKey.command];
    if (command) {
      command(pressedKey.args);
    }
  }
};

export const initKeyBindings = () => {
  console.warn("@TODO Handle init key bindings");
  // keyBindings = defaultKeys.concat(
  //   settings.get("trackerKeyBindings") === 1 ? milkytrackerKeys : openMPTKeys
  // );
};

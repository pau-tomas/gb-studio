import React, { FC } from "react";
// import Path from "path";
// import l10n from "lib/helpers/l10n";
import { Select, Option } from "./Select";
// import { remote } from "electron";
import { l10n } from "lib/renderer/api/l10n";
import { openFilePicker } from "lib/renderer/api/dialog";

// const { dialog } = remote;

interface AppSelectProps {
  value?: string;
  onChange?: (newValue: string) => void;
}

export const AppSelect: FC<AppSelectProps> = ({ value, onChange }) => {
  const options = ([] as Option[]).concat(
    [
      {
        value: "choose",
        label: l10n("FIELD_CHOOSE_APPLICATION"),
      },
      {
        value: "",
        label: l10n("FIELD_SYSTEM_DEFAULT"),
      },
    ],
    value
      ? {
          value,
          label: "FIX_ME",
          // label: Path.basename(value),
        }
      : []
  );

  const currentValue =
    options.find((option) => option.value === value) || options[0];

  const onSelectOption = async (newValue: Option) => {
    if (newValue.value === "choose") {
      const filePath = await openFilePicker();
      if (filePath) {
        onChange?.(filePath);
      }
      // const path = await dialog.showOpenDialog({
      //       properties: ["openFile"],
      //     });
      //     if (path.filePaths[0]) {
      //       // const newPath = Path.normalize(path.filePaths[0]);
      //       const newPath = "FIX_ME";
      //       onChange?.(newPath);
      //     }
    } else {
      onChange?.(newValue.value);
    }
  };

  return (
    <Select options={options} value={currentValue} onChange={onSelectOption} />
  );
};

import React from "react";
import path from "path";
import { Select, Option } from "./Select";
import { dialog } from "renderer/lib/api";
import l10n from "shared/lib/l10n";

const { openFilePicker } = dialog;

interface AppSelectProps {
  value?: string;
  onChange?: (newValue: string) => void;
}

export const AppSelect = ({ value, onChange }: AppSelectProps) => {
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
          label: path.basename(value),
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
    } else {
      onChange?.(newValue.value);
    }
  };

  return (
    <Select options={options} value={currentValue} onChange={onSelectOption} />
  );
};

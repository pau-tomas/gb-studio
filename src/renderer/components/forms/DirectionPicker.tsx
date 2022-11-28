import React from "react";
import {
  TriangleIcon,
  TriangleLeftIcon,
  TriangleRightIcon,
  TriangleDownIcon,
} from "ui/icons/Icons";
import l10n from "shared/lib/l10n";
import { ToggleButtonGroup } from "ui/form/ToggleButtonGroup";

interface DirectionPickerProps {
  id: string;
  value: string;
  onChange: (newValue: string) => void;
}

const options = [
  {
    value: "left",
    name: "Left",
    label: l10n("FIELD_DIRECTION_LEFT"),
    icon: <TriangleLeftIcon />,
  },
  {
    value: "up",
    name: "Up",
    label: l10n("FIELD_DIRECTION_UP"),
    icon: <TriangleIcon />,
  },
  {
    value: "down",
    name: "Down",
    label: l10n("FIELD_DIRECTION_DOWN"),
    icon: <TriangleDownIcon />,
  },
  {
    value: "right",
    name: "Right",
    label: l10n("FIELD_DIRECTION_RIGHT"),
    icon: <TriangleRightIcon />,
  },
];

const DirectionPicker = ({ id, value, onChange }: DirectionPickerProps) => {
  return (
    <ToggleButtonGroup
      name={id}
      value={value}
      options={options}
      onChange={onChange}
    />
  );
};

export default DirectionPicker;

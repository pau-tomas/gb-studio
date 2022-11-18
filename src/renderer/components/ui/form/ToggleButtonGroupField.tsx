import React from "react";
import styled from "styled-components";
import {
  ToggleButtonGroup,
  ToggleButtonGroupOption,
} from "./ToggleButtonGroup";
import { Label } from "./Label";

export type ToggleButtonGroupFieldProps = {
  name: string;
  label?: string;
  options: ToggleButtonGroupOption[];
} & (
  | {
      multiple: true;
      value: string[];
      onChange: (newValue: string[]) => void;
    }
  | { multiple?: false; value: string; onChange: (newValue: string) => void }
);

const Wrapper = styled.div`
  width: 100%;
`;

export const ToggleButtonGroupField = ({
  name,
  label,
  value,
  options,
  onChange,
  multiple,
}: ToggleButtonGroupFieldProps) => (
  <Wrapper>
    {label && <Label htmlFor={name}>{label}</Label>}
    {multiple ? (
      <ToggleButtonGroup
        name={name}
        value={value}
        options={options}
        multiple={multiple}
        onChange={onChange}
      />
    ) : (
      <ToggleButtonGroup
        name={name}
        value={value}
        options={options}
        onChange={onChange}
      />
    )}
  </Wrapper>
);

ToggleButtonGroupField.defaultProps = {
  value: undefined,
};

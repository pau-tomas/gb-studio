import React, { useCallback } from "react";
import styled from "styled-components";

export interface ToggleButtonGroupOption {
  value: string;
  label: string;
  icon?: JSX.Element;
}

export type ToggleButtonGroupProps = {
  name: string;
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
  display: flex;
  background: ${(props) => props.theme.colors.input.background};
  color: ${(props) => props.theme.colors.input.text};
  border: 1px solid ${(props) => props.theme.colors.input.border};
  font-size: ${(props) => props.theme.typography.fontSize};
  border-radius: 4px;
  box-sizing: border-box;
  width: 100%;
  height: 28px;

  & > * {
    border-right: 1px solid ${(props) => props.theme.colors.input.border};
  }

  & > *:last-child {
    border-right: 0;
  }
`;

const Option = styled.div`
  position: relative;
  width: 100%;
  padding: 5px;

  :hover {
    background: ${(props) => props.theme.colors.input.hoverBackground};
  }

  :focus {
    border: 1px solid ${(props) => props.theme.colors.highlight};
    background: ${(props) => props.theme.colors.input.activeBackground};
  }
`;

const Input = styled.input`
  width: 1px;
  height: 1px;
  opacity: 0;
`;

const Label = styled.label`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  svg {
    fill: ${(props) => props.theme.colors.input.text};
    width: 8px;
    height: 8px;
  }

  ${Option}:first-child > & {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  ${Option}:last-child > & {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  ${Input}:checked + & {
    color: ${(props) => props.theme.colors.input.background};
    background: ${(props) => props.theme.colors.highlight};
    svg {
      fill: ${(props) => props.theme.colors.input.background};
    }
  }

  ${Input}:focus + & {
    border: 1px solid ${(props) => props.theme.colors.highlight};
    box-shadow: 0 0 0px 2px ${(props) => props.theme.colors.highlight};
  }
`;

export const ToggleButtonGroup = ({
  name,
  value,
  multiple,
  options,
  onChange: onChangeFn,
}: ToggleButtonGroupProps) => {
  const isChecked = useCallback(
    (check: string) => {
      return multiple ? value.includes(check) : value === check;
    },
    [multiple, value]
  );

  const onChange = useCallback(
    (val: string) => {
      if (multiple) {
        if (Array.isArray(value) && value.includes(val)) {
          return value.filter((v) => v !== val);
        } else {
          onChangeFn(([] as string[]).concat(value, val));
        }
      } else {
        onChangeFn(val);
      }
    },
    [multiple, onChangeFn, value]
  );

  return (
    <Wrapper>
      {options.map((option) => (
        <Option key={option.value} title={option.label}>
          <Input
            id={`${name}__${option.value}`}
            type="radio"
            name={name}
            checked={isChecked(option.value)}
            onChange={() => onChange(option.value)}
          />
          <Label htmlFor={`${name}__${option.value}`}>
            {option.icon ? option.icon : option.label}
          </Label>
        </Option>
      ))}
    </Wrapper>
  );
};

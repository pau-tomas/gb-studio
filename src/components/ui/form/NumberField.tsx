import React, { FC, useState } from "react";
import styled from "styled-components";
import { NumberInput } from "./NumberInput";
import { Label } from "./Label";

interface NumberFieldProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  name: string;
  label?: string;
  value?: number;
}

const Wrapper = styled.div`
  width: 100%;
`;

export const NumberField: FC<NumberFieldProps> = ({
  name,
  label,
  value,
  min,
  max,
  readOnly,
  placeholder,
  onChange,
}) => {
  const [val, setVal] = useState(String(value));
  let displayVal = val;
  if (displayVal && !isNaN(Number(displayVal))) {
    if (min) {
      displayVal = String(Math.max(Number(min), Number(displayVal)));
    }
    if (max) {
      displayVal = String(Math.min(Number(max), Number(displayVal)));
    }
  }
  return (
    <Wrapper>
      {label && <Label htmlFor={name}>{label}</Label>}
      <NumberInput
        type="number"
        id={name}
        name={name}
        value={value || ""}
        min={min}
        max={max}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={onChange}
      />
    </Wrapper>
  );
};

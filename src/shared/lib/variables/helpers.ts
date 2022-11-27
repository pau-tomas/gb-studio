export const toVariableNumber = (variable: string) => {
  return variable.replace(/[^0-9]/g, "");
};

export const isVariableLocal = (variable: string) => {
  return ["L0", "L1", "L2", "L3", "L4", "L5"].indexOf(variable) > -1;
};

export const isVariableTemp = (variable: string) => {
  return ["T0", "T1"].indexOf(variable) > -1;
};

export const isVariableCustomEvent = (variable: string) => {
  return (
    ["V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9"].indexOf(
      variable
    ) > -1
  );
};

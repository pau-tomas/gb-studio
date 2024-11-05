const l10n = require("../helpers/l10n").default;

const id = "EVENT_ARRAY_GET";
const groups = ["EVENT_GROUP_VARIABLES"];
const autoLabel = (fetchArg) => {
  return l10n("EVENT_ARRAY_GET_LABEL", {
    variable: fetchArg("variable"),
    arrayVariable: fetchArg("arrayVariable"),
    index: fetchArg("index"),
  });
};
const fields = [
  {
    key: "variable",
    label: l10n("FIELD_SET_VARIABLE"),
    description: l10n("FIELD_SET_VARIABLE_DESC"),
    type: "variable",
    defaultValue: "LAST_VARIABLE",
  },
  {
    type: "group",
    fields: [
      {
        key: "arrayVariable",
        label: l10n("FIELD_FROM_VARIABLE"),
        description: l10n("FIELD_FROM_VARIABLE_DESC"),
        type: "variable",
        defaultValue: "LAST_VARIABLE",
      },
      {
        key: "index",
        label: l10n("FIELD_INDEX"),
        description: l10n("FIELD_INDEX_DESC"),
        type: "value",
        min: 0,
        max: 255,
        defaultValue: {
          type: "number",
          value: 0,
        },
      },
    ],
  },
];
const compile = (input, helpers) => {
  const { variableSetToArrayValue } = helpers;
  variableSetToArrayValue(input.variable, input.arrayVariable, input.index);
};
module.exports = {
  id,
  autoLabel,
  groups,
  fields,
  compile,
};

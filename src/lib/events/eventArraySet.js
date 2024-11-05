const l10n = require("../helpers/l10n").default;

const id = "EVENT_ARRAY_SET";
const groups = ["EVENT_GROUP_VARIABLES"];
const autoLabel = (fetchArg) => {
  return l10n("EVENT_ARRAY_SET_LABEL", {
    variable: fetchArg("variable"),
    index: fetchArg("index"),
    value: fetchArg("value"),
  });
};
const fields = [
  {
    type: "group",
    fields: [
      {
        key: "variable",
        label: l10n("FIELD_VARIABLE"),
        description: l10n("FIELD_VARIABLE_DESC"),
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
  {
    key: "value",
    label: l10n("FIELD_SET_TO_VALUE"),
    description: l10n("FIELD_SET_TO_VALUE_DESC"),
    type: "value",
    min: 0,
    max: 255,
    defaultValue: {
      type: "number",
      value: 0,
    },
  },
];
const compile = (input, helpers) => {
  const { variableArraySetToValue } = helpers;
  variableArraySetToValue(input.variable, input.index, input.value);
};
module.exports = {
  id,
  autoLabel,
  groups,
  fields,
  compile,
};

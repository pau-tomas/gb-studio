const l10n = require("../helpers/l10n").default;

const id = "EVENT_LOOP_ARRAY";
const groups = ["EVENT_GROUP_CONTROL_FLOW"];

const autoLabel = (fetchArg) => {
  return l10n("EVENT_LOOP_FOR_LABEL", {
    variable: fetchArg("variable"),
    from: fetchArg("from"),
    comparison: fetchArg("comparison"),
    to: fetchArg("to"),
    operation: fetchArg("operation"),
    val: fetchArg("value"),
  });
};

const fields = [
  {
    key: "variable",
    label: l10n("FIELD_FOR"),
    description: l10n("FIELD_VARIABLE_DESC"),
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
        key: "startIndex",
        label: l10n("FIELD_FROM_INDEX"),
        description: l10n("FIELD_FROM_INDEX_DESC"),
        type: "value",
        min: 0,
        max: 255,
        defaultValue: {
          type: "number",
          value: 0,
        },
      },
      {
        key: "endIndex",
        label: l10n("FIELD_TO_INDEX"),
        description: l10n("FIELD_TO_INDEX_DESC"),
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
    key: "true",
    type: "events",
  },
];

const compile = (input, helpers) => {
  const {
    labelDefine,
    labelGoto,
    getNextLabel,
    compileEvents,
    variableSetToScriptValue,
    variableSetToArrayValue,
    ifVariableCompare,
    variableInc,
    _declareLocal,
    _addNL,
  } = helpers;
  const tmpCurrentIndexRef = _declareLocal("currentIndex", 1, true);
  const tmpEndIndexRef = _declareLocal("endIndex", 1, true);
  const loopId = getNextLabel();

  variableSetToScriptValue(tmpCurrentIndexRef, input.startIndex);
  variableSetToScriptValue(tmpEndIndexRef, input.endIndex);

  labelDefine(loopId);
  ifVariableCompare(tmpCurrentIndexRef, ".LTE", tmpEndIndexRef, () => {
    _addNL();

    variableSetToArrayValue(input.variable, input.arrayVariable, {
      type: "variable",
      value: tmpCurrentIndexRef,
    });
    variableInc(tmpCurrentIndexRef);

    compileEvents(input.true);

    labelGoto(loopId);
  });
};

module.exports = {
  id,
  description: l10n("EVENT_LOOP_FOR_DESC"),
  autoLabel,
  groups,
  fields,
  compile,
};

const l10n = require("../helpers/l10n").default;

const id = "EVENT_SET_MUSIC_ROUTINE_SCRIPT";

const fields = [
  {
    key: "routine",
    type: "select",
    options: [
      [0, "Routine 0"],
      [1, "Routine 1"],
      [2, "Routine 2"],
      [3, "Routine 3"],
    ],
  },  
  {
    key: "parameter",
    type: "variable",
    label: "Store parameter in"
  },
  {
    key: "__scriptTabs",
    type: "tabs",
    defaultValue: "call",
    values: {
      call: "On Routine Call",
    }
  },
  {
    key: "true",
    type: "events",
    conditions: [
      {
        key: "__scriptTabs",
        in: [undefined, "call"]
      }
    ]
  }
];

const compile = (input, helpers) => {
  const { musicRoutineScriptSet } = helpers;
  musicRoutineScriptSet(input.routine, input.true);
};

module.exports = {
  id,
  fields,
  compile
};

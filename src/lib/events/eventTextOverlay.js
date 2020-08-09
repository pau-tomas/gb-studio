const l10n = require("../helpers/l10n").default;

const id = "EVENT_OVERLAY_TEXT";

const fields = [
  {
    key: "x",
    label: l10n("FIELD_X"),
    type: "number",
    min: 0,
    max: 30,
    defaultValue: 0,
    width: "50%"
  },
  {
    key: "y",
    label: l10n("FIELD_Y"),
    type: "number",
    min: 0,
    max: 31,
    defaultValue: 0,
    width: "50%"
  },
  {
    key: "type",
    type: "select",
    options: [
      ["text",  "Text"],
      ["var",   "Variable"],
      ["tile",  "Repeating Tile"],
      ["spr",   "Sprite"],
    ],
    defaultValue: "text"
  },
  {
    key: "text",
    type: "text",
    placeholder: "Text",
    conditions: [
      {
        key: "type",
        eq: "text"
      }
    ],
    maxLength: 20
  },
  {
    key: "variable",
    type: "variable",
    conditions: [
      {
        key: "type",
        eq: "var"
      }
    ],
    defaultValue: "LAST_VARIABLE"
  },
  {
    key: "tile",
    label: "With value",
    type: "text",
    placeholder: "Text",
    conditions: [
      {
        key: "type",
        eq: "tile"
      }
    ],
    width: "50%",
    maxLength: 1
  },
  {
    key: "emptyTile",
    label: "When empty",
    type: "text",
    placeholder: "Text",
    conditions: [
      {
        key: "type",
        eq: "tile"
      }
    ],
    width: "50%",
    maxLength: 1
  },
  {
    key: "tileVar",
    label: "Value",
    type: "variable",
    conditions: [
      {
        key: "type",
        eq: "tile"
      }
    ],
    defaultValue: "LAST_VARIABLE"
  },
  {
    key: "maxValue",
    label: "Max value",
    type: "number",
    conditions: [
      {
        key: "type",
        eq: "tile"
      }
    ],
    defaultValue: 10
  },
];

const compile = (input, helpers) => {
  const { overlayText, overlayTile } = helpers;

  switch (input.type) {
    case "tile":
      overlayTile(
        input.tile || " ",
        input.emptyTile || " ",
        input.tileVar,
        input.maxValue,
        input.x,
        input.y)
      break;
    case "var":
      console.error("@TODO: Variables should be handled with it's own command")
      overlayText(
        `$${input.variable | 0}$`,
        input.x,
        input.y
      );    
      break;
    case "text":
    default:
      overlayText(
        input.text,
        input.x,
        input.y
      );    
      break;
  }
};

module.exports = {
  id,
  fields,
  compile
};

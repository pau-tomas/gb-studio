const l10n = require("../helpers/l10n").default;

const id = "EVENT_BACKGROUND_SET_TILE";

const fields = [
  {
    key: "x",
    label: l10n("FIELD_X"),
    type: "number",
    min: 0,
    max: 255,
    width: "50%",
    defaultValue: 0,
  },
  {
    key: "y",
    label: l10n("FIELD_Y"),
    type: "number",
    min: 0,
    max: 255,
    width: "50%",
    defaultValue: 0,
  },
  {
    key: "tilesetId",
    type: "tileset",
    defaultValue: "LAST_TILESET",
  },
  {
    key: "tile",
    label: "Tile",
    type: "union",
    types: ["number", "variable"],
    defaultType: "number",
    min: 0,
    max: 255,
    defaultValue: {
      number: 0,
      variable: "LAST_VARIABLE",
    }
  },
  {
    key: "w",
    label: l10n("FIELD_W"),
    type: "number",
    min: 0,
    max: 255,
    width: "50%",
    defaultValue: 0,
  },
  {
    key: "h",
    label: l10n("FIELD_H"),
    type: "number",
    min: 0,
    max: 255,
    width: "50%",
    defaultValue: 0,
  }
];

const compile = (input, helpers) => {
  const { backgroundSetTile, variableFromUnion, temporaryEntityVariable } = helpers;
  const tileVar = variableFromUnion(
    input.tile,
    temporaryEntityVariable(0)
  );
  backgroundSetTile(input.tilesetId, tileVar, input.x, input.y, input.w, input.h);
};

module.exports = {
  id,
  fields,
  compile,
};

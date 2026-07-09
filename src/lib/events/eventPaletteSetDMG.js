const l10n = require("../helpers/l10n").default;

const id = "EVENT_PALETTE_SET_DMG";
const groups = ["EVENT_GROUP_COLOR"];

const fields = [
  {
    label: "Palettes",
  },
  {
    type: "dmgpalette",
    key: "bgp",
    dmgPaletteType: "bgp",
  },
  {
    type: "dmgpalette",
    key: "obp0",
    dmgPaletteType: "obp0",
  },
  {
    type: "dmgpalette",
    key: "obp1",
    dmgPaletteType: "obp1",
  },
];

const compile = (input, helpers) => {
  const { _addComment, _paletteLoad, _paletteDMG } = helpers;

  /*
VM_LOAD_PALETTE         ^/ 0b00000001 /, ^/.PALETTE_COMMIT | .PALETTE_BKG /
    .DMG_PAL             3, 2, 1, 0
    
VM_LOAD_PALETTE         ^/ 0b00000011 /, ^/.PALETTE_COMMIT | .PALETTE_SPRITE/
    .DMG_PAL             0, 3, 1, 0
    .DMG_PAL             0, 2, 2, 3

*/

  const { applyPaletteBGP, BGPcolor0, BGPcolor1, BGPcolor2, BGPcolor3 } = input;

  if (applyPaletteBGP) {
    _addComment("Set BGP Palette");

    _paletteLoad(1, ".PALETTE_BKG", true);
    _paletteDMG(BGPcolor0 ?? 0, BGPcolor1 ?? 1, BGPcolor2 ?? 2, BGPcolor3 ?? 3);
  }

  const {
    applyPaletteOBP0,
    OBP0color0,
    OBP0color1,
    OBP0color2,
    applyPaletteOBP1,
    OBP1color0,
    OBP1color1,
    OBP1color2,
  } = input;

  if (applyPaletteOBP0 || applyPaletteOBP1) {
    _addComment("Set Sprites Palette");

    let mask = applyPaletteOBP0 ? 0x01 : 0x00;
    mask += applyPaletteOBP1 ? 0x10 : 0x00;

    _paletteLoad(mask, ".PALETTE_SPRITE", true);
    if (applyPaletteOBP0) {
      _paletteDMG(0, OBP0color0 ?? 0, OBP0color1 ?? 1, OBP0color2 ?? 3);
    }
    if (applyPaletteOBP1) {
      _paletteDMG(0, OBP1color0 ?? 0, OBP1color1 ?? 2, OBP1color2 ?? 3);
    }
  }

  // _paletteLoad(mask, ".PALETTE_BKG", true);
};

module.exports = {
  id,
  description: l10n("EVENT_PALETTE_SET_DMG_DESC"),
  groups,
  fields,
  compile,
};

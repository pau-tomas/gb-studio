import ScriptBuilder from "lib/compiler/scriptBuilder/scriptBuilder";
import { PrecompiledScene } from "../../src/lib/compiler/generateGBVMData";
import {
  dummyActorNormalized,
  dummyPrecompiledBackground,
  dummyPrecompiledSpriteSheet,
} from "../dummydata";
import { getTestScriptHandlers } from "../getTestScriptHandlers";

test("Should set variable to an array with a complex index", async () => {
  const output: string[] = [];
  const scriptEventHandlers = await getTestScriptHandlers();
  const sb = new ScriptBuilder(output, {
    scriptEventHandlers,
    scene: {
      id: "scene1",
      name: "Scene 1",
      symbol: "scene_1",
      width: 20,
      height: 18,
      background: dummyPrecompiledBackground,
      playerSprite: dummyPrecompiledSpriteSheet,
      sprites: [],
      parallax: [],
      actorsExclusiveLookup: {},
      type: "TOPDOWN",
      actors: [{ ...dummyActorNormalized, id: "actor1" }],
      triggers: [],
      projectiles: [],
    } as unknown as PrecompiledScene,
    entity: {
      id: "actor1",
      name: "Actor 1",
    },
  });
  const scriptValue = {
    type: "array",
    id: "4",
    index: {
      type: "add",
      valueA: { type: "variable", value: "L0" },
      valueB: { type: "number", value: 1 },
    },
  } as const;
  sb.variableSetToScriptValue("2", scriptValue);
  expect(output).toEqual([
    "        ; Variable Set To",
    "        ; -- Calculate value",
    "        VM_RPN",
    "            .R_INT16    VAR_VARIABLE_4",
    "            .R_REF      VAR_S0_LOCAL_0",
    "            .R_INT16    1",
    "            .R_OPERATOR .ADD",
    "            .R_OPERATOR .ADD",
    "            .R_REF_SET  .LOCAL_TMP0_LOCAL_ARRAY_4_INDEX_0",
    "            .R_REF_IND  .LOCAL_TMP0_LOCAL_ARRAY_4_INDEX_0",
    "            .R_REF_SET  VAR_VARIABLE_2",
    "            .R_STOP",
    "",
  ]);
});

import reducer, {
  initialState,
  EngineState,
  EngineFieldSchema,
} from "renderer/project/store/features/engine/engineState";
import actions from "renderer/project/store/features/engine/engineActions";

test("Should be able to set section", () => {
  const state: EngineState = {
    ...initialState,
    fields: [],
  };
  const newEngineFields: EngineFieldSchema[] = [
    {
      key: "test_field",
      label: "Test Field",
      group: "Global",
      type: "number",
      cType: "UBYTE",
      defaultValue: 1,
    },
  ];
  const action = actions.setEngineFields(newEngineFields);
  const newState = reducer(state, action);
  expect(newState.fields).toEqual(newEngineFields);
});

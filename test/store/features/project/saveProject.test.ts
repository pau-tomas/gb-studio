import reducer, {
  initialState,
} from "renderer/project/store/features/document/documentState";
import actions from "renderer/project/store/features/project/projectActions";

test("Should not change the path and root if saving existing project", () => {
  const state = {
    ...initialState,
    saving: true,
    path: "initial_test_root/project.gbsproj",
    root: "initial_test_root/",
    modified: true,
  };
  const action = actions.saveProject.fulfilled(
    "initial_test_root/project.gbsproj",
    "randomid",
    undefined
  );
  const newState = reducer(state, action);
  expect(newState.saving).toBe(false);
  expect(newState.path).toBe("initial_test_root/project.gbsproj");
  expect(newState.root).toBe("initial_test_root/");
  expect(newState.modified).toBe(false);
});

import reducer, {
  initialState,
} from "renderer/project/store/features/document/documentState";
import actions from "renderer/project/store/features/project/projectActions";

test("Should cause the project to enter saving state", () => {
  const state = {
    ...initialState,
    saving: false,
  };
  const action = actions.saveProject.pending("newfile.gbsproj", undefined);
  const newState = reducer(state, action);
  expect(newState.saving).toBe(true);
});

test("Should cause project to exit saving state without changing anything", () => {
  const state = {
    ...initialState,
    saving: true,
  };
  const action = actions.saveProject.rejected(
    new Error("Failed"),
    "randomid",
    undefined
  );
  const newState = reducer(state, action);
  expect(newState.saving).toBe(false);
});

test("Should change the path and root to new path and root and update modified state", () => {
  const state = {
    ...initialState,
    saving: true,
    path: "initial_test_root/project.gbsproj",
    root: "initial_test_root/",
    modified: true,
  };
  const action = actions.saveProject.fulfilled(
    "new_test_root/project_copy.gbsproj",
    "randomid",
    undefined
  );
  const newState = reducer(state, action);
  expect(newState.saving).toBe(false);
  expect(newState.path).toBe("new_test_root/project_copy.gbsproj");
  expect(newState.root).toBe("new_test_root");
  expect(newState.modified).toBe(false);
});

test("Should change the path and root to new path and root and keep modified state off", () => {
  const state = {
    ...initialState,
    saving: true,
    path: "initial_test_root/project.gbsproj",
    root: "initial_test_root/",
    modified: false,
  };
  const action = actions.saveProject.fulfilled(
    "randomid",
    "new_test_root/project_copy.gbsproj",
    undefined
  );
  const newState = reducer(state, action);
  expect(newState.saving).toBe(false);
  expect(newState.path).toBe("new_test_root/project_copy.gbsproj");
  expect(newState.root).toBe("new_test_root");
  expect(newState.modified).toBe(false);
});

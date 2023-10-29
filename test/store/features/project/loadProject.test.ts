import reducer, {
  initialState,
} from "renderer/project/store/features/document/documentState";
import actions from "renderer/project/store/features/project/projectActions";
import { dummyProjectData } from "../../../dummydata";

test("Should set loaded state to false while loading project", () => {
  const state = {
    ...initialState,
    loaded: true,
  };
  const action = actions.loadProject.pending("newfile.gbsproj");
  const newState = reducer(state, action);
  expect(newState.loaded).toBe(false);
});

test("Should change the path and root to new path and root and set loaded to true after loading is finished", () => {
  const state = {
    ...initialState,
    loaded: false,
    path: "initial_test_root/project.gbsproj",
    root: "initial_test_root/",
    modified: true,
  };
  const action = actions.loadProject.fulfilled(
    {
      data: dummyProjectData,
      path: "new_test_root/project_copy.gbsproj",
      modifiedSpriteIds: [],
      scriptEventDefs: {},
    },
    "new_test_root/project_copy.gbsproj"
  );
  const newState = reducer(state, action);
  expect(newState.loaded).toBe(true);
  expect(newState.path).toBe("new_test_root/project_copy.gbsproj");
  expect(newState.root).toBe("new_test_root");
  expect(newState.modified).toBe(false);
});

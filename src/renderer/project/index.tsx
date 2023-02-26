import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "renderer/project/store/configureStore";
import { AppContainer } from "react-hot-loader";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ThemeProvider from "ui/theme/ThemeProvider";
import GlobalStyle from "ui/globalStyle";
import API from "renderer/lib/api";
import App from "./components/App";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import "../../styles/App.css";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import "../../styles/theme.css";
import { setLanguageData } from "shared/lib/l10n";
import projectActions from "./store/features/project/projectActions";
import editorActions from "./store/features/editor/editorActions";
import { isZoomSection } from "./store/features/editor/editorState";
import navigationActions from "./store/features/navigation/navigationActions";
import { ActionCreators } from "redux-undo";
import { TRACKER_REDO, TRACKER_UNDO } from "shared/consts";
console.warn("@TODO Replace CSS imports with styled components");

// Attach store to global scope for debugging
(
  window as unknown as {
    store: typeof store;
  }
).store = store;

API.project.onRequestSave((saveAs) => {
  store.dispatch(projectActions.saveProject(saveAs));
});
API.project.onRequestSaveAndQuit(async () => {
  await store.dispatch(projectActions.saveProject());
  window.close();
});
API.project.onZoom((zoomType: "in" | "out" | "reset") => {
  const state = store.getState();
  const section = state.navigation.section;
  if (!isZoomSection(section)) {
    return;
  }
  if (zoomType === "in") {
    store.dispatch(editorActions.zoomIn({ section }));
  } else if (zoomType === "out") {
    store.dispatch(editorActions.zoomOut({ section }));
  } else {
    store.dispatch(editorActions.zoomReset({ section }));
  }
});
API.project.onSetSection((section) => {
  store.dispatch(navigationActions.setSection(section));
});

API.app.onUndo(() => {
  if (store.getState().trackerDocument.past.length > 0) {
    store.dispatch({ type: TRACKER_UNDO });
  } else {
    store.dispatch(ActionCreators.undo());
  }
});

API.app.onRedo(() => {
  if (store.getState().trackerDocument.future.length > 0) {
    store.dispatch({ type: TRACKER_REDO });
  } else {
    store.dispatch(ActionCreators.redo());
  }
});

// Send document modified state back to main process
let modified = true;
store.subscribe(() => {
  const state = store.getState();
  if (!modified && state.document.modified) {
    API.project.setModified();
  }
  modified = state.document.modified;
});

const render = async () => {
  setLanguageData(await API.getL10NData());
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <DndProvider backend={HTML5Backend}>
          <ThemeProvider>
            <GlobalStyle />
            <App />
          </ThemeProvider>
        </DndProvider>
      </Provider>
    </AppContainer>,
    document.getElementById("App")
  );
};

render();

if (module.hot) {
  module.hot.accept(render);
}

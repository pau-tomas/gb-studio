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
import {
  denormalizeProject,
  ProjectData,
  trimDenormalisedProject,
} from "./store/features/project/projectActions";
console.warn("@TODO Replace CSS imports with styled components");

// Attach store to global scope for debugging
(
  window as unknown as {
    store: typeof store;
  }
).store = store;

API.project.onRequestSave((saveAs) => {
  const state = store.getState();
  if (!state.document.loaded) {
    throw new Error("Cannot save project that has not finished loading");
  }
  if (!saveAs && !state.document.modified) {
    throw new Error("Cannot save unmodified project");
  }
  const normalizedProject = trimDenormalisedProject(
    denormalizeProject(state.project.present)
  );
  const data: ProjectData = {
    ...normalizedProject,
    settings: {
      ...normalizedProject.settings,
      zoom: state.editor.zoom,
      worldScrollX: state.editor.worldScrollX,
      worldScrollY: state.editor.worldScrollY,
      navigatorSplitSizes: state.editor.navigatorSplitSizes,
    },
  };
  API.project.saveProjectData(data, saveAs);
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

import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "renderer/project/store/configureStore";
import { AppContainer } from "react-hot-loader";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ThemeProvider from "ui/theme/ThemeProvider";
import GlobalStyle from "ui/globalStyle";
import API from "lib/renderer/api";
import App from "./components/App";
import "../../styles/App.css";
import "../../styles/theme.css";

const urlParams = new URLSearchParams(window.location.search);
const projectPath = urlParams.get("path") || undefined;

// Attach store to global scope for debugging
(
  window as unknown as {
    store: typeof store;
  }
).store = store;

const render = async () => {
  await API.l10nInit();
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <DndProvider backend={HTML5Backend}>
          <ThemeProvider>
            <GlobalStyle />
            <App projectPath={projectPath} />
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

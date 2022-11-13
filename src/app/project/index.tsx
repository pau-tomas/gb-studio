import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "project/store/configureStore";
import AppContainerDnD from "components/app/AppContainerDnD";
import ThemeProvider from "ui/theme/ThemeProvider";
import GlobalStyle from "ui/globalStyle";
import API from "lib/renderer/api";
import App from "./components/App";
import "../../styles/App.css";
import "../../styles/theme.css";

const urlParams = new URLSearchParams(window.location.search);
const projectPath = urlParams.get("path") || undefined;

(window as any).store = store;

const render = async () => {
  await API.l10nInit();
  ReactDOM.render(
    <Provider store={store}>
      <ThemeProvider>
        <GlobalStyle />
        <AppContainerDnD>
          <App projectPath={projectPath} />
        </AppContainerDnD>
      </ThemeProvider>
    </Provider>,
    document.getElementById("App")
  );
};

render();

if (module.hot) {
  module.hot.accept(render);
}

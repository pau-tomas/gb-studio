import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "store/configureStore";
import App from "components/app/App";
import AppContainerDnD from "components/app/AppContainerDnD";
import ThemeProvider from "ui/theme/ThemeProvider";
import GlobalStyle from "ui/globalStyle";
import API from "lib/renderer/api";

const render = async () => {
  await API.l10nInit();
  ReactDOM.render(
    <Provider store={store}>
      <ThemeProvider>
        <GlobalStyle />
        <AppContainerDnD>
          <App />
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

import About from "./components/About";
import React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";
import API from "renderer/lib/api";
import { setLanguageData } from "shared/lib/l10n";

const render = async () => {
  setLanguageData(await API.getL10NData());
  ReactDOM.render(
    <AppContainer>
      <About />
    </AppContainer>,
    document.getElementById("App")
  );
};

render();

if (module.hot) {
  module.hot.accept(render);
}

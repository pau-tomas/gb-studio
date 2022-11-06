import React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";
import Preferences from "components/app/Preferences";
import API from "lib/renderer/api";

const render = async () => {
  await API.l10nInit();
  ReactDOM.render(
    <AppContainer>
      <Preferences />
    </AppContainer>,
    document.getElementById("App")
  );
};

render();

if (module.hot) {
  module.hot.accept(render);
}

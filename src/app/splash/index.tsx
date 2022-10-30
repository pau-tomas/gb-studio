import React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";
import Splash from "components/app/Splash";
// import { l10n } from "./api";

// import "lib/electron/handleFullScreen";
// import "lib/helpers/handleTheme";
// import "../../styles/App.css";

window.addEventListener("error", (error) => {
  if (error.message.indexOf("dead code elimination") > -1) {
    return true;
  }
  error.stopPropagation();
  error.preventDefault();
  document.body.innerHTML = `<div class="GlobalError">
    <div class="GlobalError__Content">
      <h2>${error.message}</h2>
      <p>
        ${error.filename}L:${error.lineno}C:${error.colno}
      </p>     
      <div class="GlobalError__StackTrace">
        ${
          error.error &&
          error.error.stack &&
          error.error.stack
            .split("\n")
            .map((line) => `<div>${line}</div>`)
            .join("")
        }
      </div>
    </div>       
    </div>
  </div>`;
  return false;
});

const render = () => {
  ReactDOM.render(
    <AppContainer>
      <Splash />
    </AppContainer>,
    document.getElementById("App")
  );
};

render();

if (module.hot) {
  module.hot.accept(render);
}

// import React from "react";
// import ReactDOM from "react-dom";
// const SplashAPI = window.SplashAPI;

// console.log("ABC");
// console.log({ SplashAPI });

// const App = () => {
//   return (
//     <div>
//       APP!!!{" "}
//       <button
//         onClick={() => {
//           console.log("CLICK");
//           SplashAPI.openExternal("/Users/cmaltby/Desktop/mr-pdf.pdf");
//         }}
//       >
//         BUTTON!!?!!00
//       </button>
//     </div>
//   );
// };

// const render = () => {
//   ReactDOM.render(<App />, document.getElementById("App"));
// };

// render();

// // if (module.hot) {
// //   module.hot.accept(render);
// // }

import React from "react";
import ReactDOM from "react-dom";
const SplashAPI = window.SplashAPI;

console.log("ABC");
console.log({ SplashAPI });

const App = () => {
  return (
    <div>
      APP!!!{" "}
      <button
        onClick={() => {
          console.log("CLICK");
          SplashAPI.openExternal("/Users/cmaltby/Desktop/mr-pdf.pdf");
        }}
      >
        BUTTON
      </button>
    </div>
  );
};

const render = () => {
  ReactDOM.render(<App />, document.getElementById("App"));
};

render();

// if (module.hot) {
//   module.hot.accept(render);
// }

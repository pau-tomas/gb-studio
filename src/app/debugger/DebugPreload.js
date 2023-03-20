const { ipcRenderer } = require("electron");

console.log("DEBUG ROOT");

process.once("loaded", () => {
  // Listen to inbound messages from the debugger script
  // and proxy them to the main window if the action is correct
  window.addEventListener("message", (event) => {
    if (event.data.action === "to:main") {
      const message = event.data.payload;
      ipcRenderer.send("emulator-message-receive", message);
    }
  });
});

// Listen to inbound message from the main window
// and proxy them to the debugger script via post message
ipcRenderer.on("emulator-data", (_e, data) => {
  window.postMessage({
    action: "to:debugger",
    payload: data,
  });
});

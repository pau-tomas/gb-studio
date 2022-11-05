export default () => {
  if (typeof process === "undefined" || !process) {
    throw new Error(
      "This code can only be imported from the Electron main process"
    );
  }
};

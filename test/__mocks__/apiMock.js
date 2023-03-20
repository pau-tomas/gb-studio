const API = {
  platform: "darwin",
  settings: {},
  app: {},
  paths: {},
  dialog: {},
  theme: {
    getThemeSetting: () => Promise.resolve("light"),
    getShouldUseDarkColors: () => Promise.resolve(false),
    onChange: () => {},
  },
};
export const settings = API.settings;
export const app = API.app;
export const paths = API.paths;
export const dialog = API.dialog;

export default API;

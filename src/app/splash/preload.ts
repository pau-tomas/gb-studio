import { contextBridge } from "electron";
import { API } from "lib/renderer/api/preload";

contextBridge.exposeInMainWorld("API", API);

export default contextBridge;

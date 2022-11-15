import { contextBridge } from "electron";
import { API } from "renderer/lib/api/preload";

contextBridge.exposeInMainWorld("API", API);

export default contextBridge;

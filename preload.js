const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("server", {
  start: () => ipcRenderer.invoke("startServer"),
  stop: () => ipcRenderer.invoke("stopServer"),
  // status: () => ipcRenderer.invoke("serverStatus"),
  node: true,
  // node: () => process.versions.node,
  // chrome: () => process.versions.chrome,
  // electron: () => process.versions.electron,
});

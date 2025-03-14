const { app, BrowserWindow, ipcMain } = require("electron/main");
const path = require("node:path");
const fs = require("fs-extra");
//Express
const express = require("express");
const { pageRouter } = require("./express/PageRouter");
const { fileRouter } = require("./express/FileRouter");
const { getIPAddress } = require("./UtilityFunctions");
const { generateUser, getUser } = require("./UserDb");
cors = require("cors");
const server = express();
//server
server.use("/static", express.static(path.join(__dirname, "src")));
server.use(express.json());
server.use(cors());
server.put("/ping", (req, res) => {
  let id = req.body.id;

  if (id)
    res.send({
      error: false,
      connected: true,
      message: "pong",
      user: getUser(id),
    });
  else
    res.send({
      error: false,
      connected: true,
      message: "pong",
      user: generateUser("user"),
    });
});
server.use("/", pageRouter);
server.use("/files", fileRouter);
server.use("/*", (req, res) => {
  res.send({ error: true, message: "not found page" });
});

let port = 3000;
let listener = null;
function StartServer() {
  if (listener) StopServer();
  return new Promise((resolve, reject) => {
    const newListener = server.listen(port, "0.0.0.0", () => {
      console.log(
        `Server is running on http://${newListener.address().address}:${
          newListener.address().port
        }`
      );
      listener = newListener;
      resolve({
        error: false,
        message: "Server Started Successfully",
        data: { port: listener.address().port, ip: getIPAddress() },
        user: generateUser("server"),
      });
    });

    newListener.on("error", (error) => {
      console.log("Server Failed to Start:", error.message);
      listener = null;

      if (port >= 5050) {
        return reject({
          error: true,
          message: error.message,
          data: {},
          user: {},
        });
      }

      port++; // Try next port
      resolve(StartServer()); // Retry
    });
  });
}
function StopServer() {
  return new Promise((resolve) => {
    listener.close(() => {
      console.log("Server stopped");
      listener = null;
      resolve({ error: false, message: "Server Stopped" });
    });
  });
}
//Ipc Handler
ipcMain.handle("startServer", async () => {
  try {
    return await StartServer();
  } catch (error) {
    return error;
  }
});

ipcMain.handle("stopServer", async () => {
  if (listener) StopServer();
  else {
    return { error: false, message: "No active server to stop" };
  }
});

// ipcMain.handle("serverStatus", async () => {
//   if (listener) {
//     return { error: false, port: listener.address().port, ip: getIPAddress() };
//   } else return { error: true, port: null, ip: null };
// });
//Main Window

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      devTools: true,
    },
    autoHideMenuBar: true,
  });

  win.loadFile("index.html");
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

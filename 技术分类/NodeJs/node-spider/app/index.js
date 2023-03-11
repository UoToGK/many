//Created by uoto on 16/4/12.
//"packager": "electron-packager ./app HelloWorld --all --out ./OutApp --version 1.4.0 --overwrite --icon=./app/img/icon/icon.ico"
const { app, BrowserWindow, ipcMain } = require("electron"); // Module to control application life.
const path = require("path");
require("./app/lib/register-support-static-asset");
let config = require("./app/resource/config.yaml");

("use strict");
// const easyMonitor = require('easy-monitor');
// easyMonitor('me_app');

let pluginName;
switch (process.platform) {
  case "win32":
    pluginName = "pepflashplayer.dll";
    break;
  case "darwin":
    pluginName = "PepperFlashPlayer.plugin";
    break;
  case "linux":
    pluginName = "libpepflashplayer.so";
    break;
}

app.commandLine.appendSwitch("ignore-certificate-errors"); // 忽略证书错误
app.commandLine.appendSwitch("disable-http-cache"); // 禁用http缓存
app.commandLine.appendSwitch("disk-cache-size", 0); // 缓存大小为0,即不缓存
app.commandLine.appendArgument("--disk-cache-size=0");
app.commandLine.appendSwitch(
  "ppapi-flash-path",
  path.join(__dirname, "flash_lib", pluginName)
);
app.commandLine.appendSwitch("ppapi-flash-version", "22.0.0.192");
app.commandLine.appendSwitch("remote-debugging-port", "9222");
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

//单例模式,不允许同时启动多个 
var shouldQuit = app.makeSingleInstance(function (
  commandLine,
  workingDirectory
) {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

if (shouldQuit) {
  app.quit();
  return;
}

//app.setPath('appData', __dirname + '/_appData');
//app.setPath('userData', __dirname + '/_userData');
app.on("window-all-closed", function () {
  // 这个事件订阅后,守护进程将在窗口关闭时,不会直接退出
  app.quit();
});

let NO_QUIT = false;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on("ready", reCreate);

function reCreate() {
  mainWindow = createWindow();
  NO_QUIT = false;

  // 如果进程已经崩溃
  mainWindow.on("crashed", _re_create);
}
//
function _re_create() {
  // 进程已经崩溃
  NO_QUIT = true;
  mainWindow.destroy();
  mainWindow = null;
  setTimeout(reCreate, 60 * 1000); // 1分钟后重启
}

ipcMain.on("reloadIgnoringCache", function () {
  mainWindow && _re_create();
});

ipcMain.on("synchronous-message", (event, arg) => {
  window.loadURL("file://" + __dirname + "/app/login.html");
  window.webContents.reload();
  event.returnValue = "pong";
});
ipcMain.on("download", function (e, args) {
  e.preventDefault();
});
function createWindow() {
  let window = new BrowserWindow({
    width: 1900,
    height: 1000,
    minWidth: 1000,
    minHeight: 600,
    show: false,//当前不显示
    frame: false, //框架去掉
    transparent: true,
    webPreferences: {
      plugins: true,
      partition: "persist:"
    }
  });
  //if resource loaded,then to show page
  window.on('ready-to-show', () => {
    window.show();
  })
  if (config.clientMode == 2) {
    //采集端
    window.loadURL("file://" + __dirname + "/app/index.html"); // index
  } else {
    window.loadURL("file://" + __dirname + "/app/login.html"); // login
  }
  let session = window.webContents.session;

  session.on("will-download", function (event, downloadItem) {
    event.preventDefault();
    // window.webContents.send('download');
  });

  window.on("closed", function () {
    if (!NO_QUIT) {
      window = null;
      app.quit();
    }
  });

  return window;
}

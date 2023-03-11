
declare module "electron" {
    export var ipcRenderer: ipcRenderer;
    export var ipcMain;
    export var BrowserWindow: typeof Electron.BrowserWindow;
    export var app;
}

interface ipcRenderer {
    sendToHost: any;
    send: any;
    on: any;
}

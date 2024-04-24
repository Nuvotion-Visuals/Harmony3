"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_updater_1 = require("electron-updater");
const electron_log_1 = __importDefault(require("electron-log"));
electron_log_1.default.info('App starting...');
electron_updater_1.autoUpdater.logger = electron_log_1.default;
electron_1.app.commandLine.appendSwitch('force_high_performance_gpu');
let mainWindow;
const isDevelopment = process.env.NODE_ENV !== 'production';
const createWindow = () => {
    electron_updater_1.autoUpdater.checkForUpdates();
    mainWindow = new electron_1.BrowserWindow({
        icon: 'favicon.ico',
        width: 1400,
        height: 900,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false
        },
        autoHideMenuBar: true,
    });
    mainWindow.once('ready-to-show', () => {
        mainWindow.maximize();
    });
    mainWindow.loadFile('index.html');
    mainWindow.webContents.setWindowOpenHandler(() => {
        return {
            action: 'allow',
            overrideBrowserWindowOptions: {
                icon: 'favicon.ico',
                webPreferences: {
                    nodeIntegration: true,
                },
                autoHideMenuBar: true
            }
        };
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    // mainWindow.webContents.openDevTools()
    electron_1.ipcMain.on('minimize-app', () => {
        if (mainWindow)
            mainWindow.minimize();
    });
    electron_1.ipcMain.on('maximize-app', () => {
        if (mainWindow) {
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
            }
            else {
                mainWindow.maximize();
            }
        }
    });
};
electron_1.app.on('ready', createWindow);
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
// First Express Server for Visuals
const visualsApp = (0, express_1.default)();
const visualsPort = 1;
const visualsPath = isDevelopment
    ? path_1.default.join(__dirname, '../assets/visuals/dist')
    : path_1.default.join(process.resourcesPath, 'assets/visuals/dist');
visualsApp.use((req, res, next) => {
    res.setHeader('Origin-Agent-Cluster', '?1');
    next();
});
visualsApp.use(express_1.default.static(visualsPath, { extensions: ['html'] }));
visualsApp.get('*', (req, res) => {
    res.sendFile(path_1.default.resolve(visualsPath, 'index.html'));
});
visualsApp.listen(visualsPort, () => {
    console.log(`Visuals server listening on port ${visualsPort}`);
});

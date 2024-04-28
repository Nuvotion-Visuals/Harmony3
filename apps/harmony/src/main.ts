import 'dotenv/config'
import { app as electron, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import { spawn } from 'child_process'

import { initPocketbase } from './pocketbase'
import { initTts } from './tts'
import { initChat } from './chat'

import eventsource from 'eventsource'
// @ts-ignore
global.EventSource = eventsource

// Electron 
autoUpdater.logger = log
electron.commandLine.appendSwitch('force_high_performance_gpu')
let mainWindow: Electron.BrowserWindow | null
let pocketbaseProcess: ReturnType<typeof spawn> | null = null

const createWindow = () => {
  autoUpdater.checkForUpdates()

  mainWindow = new BrowserWindow({
    icon: 'icon.ico',
    width: 1400,
    height: 900,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false
    },
    autoHideMenuBar: true,
    fullscreen: false,
  })

  mainWindow.loadFile('index.html')

  mainWindow.on('closed', () => {
    mainWindow = null
    if (pocketbaseProcess) {
      pocketbaseProcess.kill()
    }
  })

  ipcMain.on('minimize-app', () => {
    mainWindow?.minimize()
  })

  ipcMain.on('maximize-app', () => {
    if (mainWindow) {
      mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
    }
  })
}

electron.on('ready', () => {
  initPocketbase()
  createWindow()
  initTts()
  initChat()
})


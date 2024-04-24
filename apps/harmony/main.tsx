import { app as electron, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import { spawn } from 'child_process'
import express from 'express'
import path from 'path'

log.info('App starting...')

autoUpdater.logger = log
electron.commandLine.appendSwitch('force_high_performance_gpu')

let mainWindow: Electron.BrowserWindow | null
let pocketbaseProcess: ReturnType<typeof spawn> | null = null

const isDevelopment = process.env.NODE_ENV !== 'production'

const createWindow = () => {
  autoUpdater.checkForUpdates()

  mainWindow = new BrowserWindow({
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

// Start PocketBase
const startPocketBase = () => {
  const pocketbasePath = path.join(__dirname, '../pocketbase')
  pocketbaseProcess = spawn(pocketbasePath, ['serve', '--http=0.0.0.0:8090'])

  // @ts-ignore
  pocketbaseProcess.stdout.on('data', data => {
    log.info(`PocketBase: ${data}`)
  })

  // @ts-ignore
  pocketbaseProcess.stderr.on('data', data => {
    log.error(`PocketBase Error: ${data}`)
  })
}

electron.on('ready', () => {
  startPocketBase()
  createWindow()
})

// Express Server for Visuals
const visualsApp = express()
const visualsPort = 1
const visualsPath = isDevelopment
  ? path.join(__dirname, '../assets/visuals/dist')
  : path.join(process.resourcesPath, 'assets/visuals/dist')

visualsApp.use((req, res, next) => {
  res.setHeader('Origin-Agent-Cluster', '?1')
  next()
})

visualsApp.use(express.static(visualsPath, { extensions: ['html'] }))

visualsApp.get('*', (req, res) => {
  res.sendFile(path.resolve(visualsPath, 'index.html'))
})

visualsApp.listen(visualsPort, () => {
  log.info(`Visuals server listening on port ${visualsPort}`)
})

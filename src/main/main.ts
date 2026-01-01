import { app, shell, BrowserWindow, screen } from 'electron'
import { join, dirname, resolve } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import fs from 'fs'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname_built = dirname(__filename)
const projectRoot = resolve(__dirname_built, '../..')

let native: any
try {
  const files = fs.readdirSync(projectRoot)
  const nodeFile = files.find(f => f.endsWith('.node'))
  if (nodeFile) {
    native = require(join(projectRoot, nodeFile))
  } else {
    throw new Error('Native binary (.node) not found in root!')
  }
} catch (e) {
  console.error('Failed to load native bridge:', e)
}

function createWindow(): void {
  // Get primary display size for a true full-screen overlay
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.bounds

  const mainWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    resizable: false,
    movable: false,
    enableLargerThanScreen: true,
    webPreferences: {
      preload: join(__dirname_built, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true
    }
  })

  // Allows clicking through the window to interact with apps beneath
  mainWindow.setIgnoreMouseEvents(true)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    
    console.log('--- PHASE 2: GHOST AURA ACTIVE ---')
    
    try {
      if (native.startMouseHook) {
        native.startMouseHook()
        
        setInterval(() => {
          const state = native.getMouseState()
          // Pipe to React
          mainWindow.webContents.send('mouse-pulse', state)
        }, 16) // ~60 FPS
      }
    } catch (err) {
      console.error('STATUS: PULSE FAILED ❌', err)
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname_built, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.aurarecord')
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
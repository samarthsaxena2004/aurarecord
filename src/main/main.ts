import { app, shell, BrowserWindow } from 'electron'
import { join, dirname, resolve } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import fs from 'fs'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname_built = dirname(__filename)

// Resolve project root (Two levels up from out/main/)
const projectRoot = resolve(__dirname_built, '../..')

let native: any
try {
  // Attempt 1: Standard index.js wrapper
  const nativeBridgePath = join(projectRoot, 'index.js')
  native = require(nativeBridgePath)
} catch (e) {
  // Attempt 2: Fallback to direct .node loading
  const files = fs.readdirSync(projectRoot)
  const nodeFile = files.find(f => f.endsWith('.node'))
  if (nodeFile) {
    native = require(join(projectRoot, nodeFile))
  } else {
    throw new Error('CRITICAL: Native binary (.node) not found in root directory.')
  }
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0a0a0a', // Matches AuraRecord aesthetic
    webPreferences: {
      preload: join(__dirname_built, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    console.log('--- NATIVE BRIDGE TEST ---')
    try {
      console.log('RUST:', native.checkRustBridge())
      console.log('STATUS: SUCCESS ✅')
    } catch (err) {
      console.error('STATUS: FAILED ❌', err)
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
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
import { app, shell, BrowserWindow } from 'electron'
import { join, dirname, resolve } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import fs from 'fs'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname_built = dirname(__filename)

// 1. Precise path to project root
const projectRoot = resolve(__dirname_built, '../..')
const nativeBridgePath = join(projectRoot, 'index.js')

// 2. DEBUG: Log what's in the root to find the bridge
console.log('--- SYSTEM CHECK ---')
console.log('Project Root:', projectRoot)
if (fs.existsSync(projectRoot)) {
  console.log('Files in Root:', fs.readdirSync(projectRoot).filter(f => f.includes('index') || f.includes('.node')))
}

let native: any
try {
  native = require(nativeBridgePath)
} catch (e) {
  console.error('Failed to load bridge via index.js, searching for fallback...')
  // Fallback: Try to find any .node file if index.js fails
  const files = fs.readdirSync(projectRoot)
  const nodeFile = files.find(f => f.endsWith('.node'))
  if (nodeFile) {
    native = require(join(projectRoot, nodeFile))
  } else {
    throw new Error('Native binary (.node) not found in root!')
  }
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: join(__dirname_built, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    console.log('------------------------------------')
    console.log('AURARECORD NATIVE BRIDGE TEST')
    try {
      // Some NAPI-RS templates export directly, others wrap in an object
      const status = typeof native.checkRustBridge === 'function' 
        ? native.checkRustBridge() 
        : 'Bridge loaded, but function checkRustBridge missing'
      console.log('RUST RESPONSE:', status)
      console.log('STATUS: SUCCESS ✅')
    } catch (err) {
      console.error('STATUS: FAILED ❌')
      console.error('ERROR:', err)
    }
    console.log('------------------------------------')
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
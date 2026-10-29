import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const serverDirectory = dirname(fileURLToPath(import.meta.url))
const projectDirectory = resolve(serverDirectory, '..')
const viteCli = resolve(projectDirectory, 'node_modules', 'vite', 'bin', 'vite.js')
const children = []
let stopping = false

function stopChildren() {
  if (stopping) return
  stopping = true
  for (const child of children) {
    if (child.exitCode === null) child.kill()
  }
}

function startProcess(label, executable, args) {
  const child = spawn(executable, args, {
    cwd: projectDirectory,
    env: process.env,
    stdio: 'inherit',
  })
  children.push(child)
  child.once('error', (error) => {
    console.error(`${label} failed to start:`, error.message)
    stopChildren()
    process.exitCode = 1
  })
  child.once('exit', (code, signal) => {
    if (stopping) return
    if (code !== 0) {
      console.error(`${label} stopped${signal ? ` (${signal})` : ` with exit code ${code}`}.`)
      process.exitCode = code || 1
      stopChildren()
    }
  })
}

process.once('SIGINT', stopChildren)
process.once('SIGTERM', stopChildren)

startProcess('API', process.execPath, [resolve(serverDirectory, 'index.js')])
startProcess('Vite', process.execPath, [viteCli])

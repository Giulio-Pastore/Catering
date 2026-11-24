import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

const resolveScript = path.join(root, 'scripts', 'resolve-wrangler-config.mjs')
const configPath = spawnSync(process.execPath, [resolveScript], {
  cwd: root,
  encoding: 'utf8',
}).stdout.trim()

if (!configPath) {
  console.error('Impossibile risolvere wrangler.json in dist/')
  process.exit(1)
}

const wranglerBin = path.join(
  root,
  'node_modules',
  'wrangler',
  'bin',
  'wrangler.js',
)

const deploy = spawnSync(process.execPath, [wranglerBin, 'deploy', '--config', configPath], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
})

process.exit(deploy.status ?? 1)
import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const distDir = path.join(root, 'dist')

function findWranglerJson() {
  let entries
  try {
    entries = readdirSync(distDir, { withFileTypes: true })
  } catch {
    throw new Error(
      'Cartella dist/ assente: esegui prima `npm run build` (worker + client).',
    )
  }

  const matches = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const configPath = path.join(distDir, entry.name, 'wrangler.json')
    try {
      statSync(configPath)
      matches.push(configPath)
    } catch {
      /* directory senza wrangler.json (es. client) */
    }
  }

  if (matches.length === 0) {
    throw new Error(
      'Nessun dist/*/wrangler.json trovato. Verifica il build Vite + @cloudflare/vite-plugin.',
    )
  }

  if (matches.length > 1) {
    throw new Error(
      `Troppi wrangler.json in dist: ${matches.map((p) => path.relative(root, p)).join(', ')}`,
    )
  }

  return matches[0]
}

const configPath = findWranglerJson()
if (process.argv.includes('--relative')) {
  console.log(path.relative(root, configPath).split(path.sep).join('/'))
} else {
  console.log(configPath)
}
import { readFileSync, writeFileSync } from 'node:fs'

const projectName = process.argv[2]
if (!projectName?.trim()) {
  console.error('Usage: node scripts/patch-wrangler-name.mjs <CLOUDFLARE_PROJECT_NAME>')
  process.exit(1)
}

/** Cloudflare Worker name: lowercase, alphanumeric, dashes. */
function sanitizeWorkerName(raw) {
  const normalized = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  if (!normalized) {
    console.error(
      `Nome Worker non valido dopo normalizzazione (input: ${JSON.stringify(raw)}).`,
    )
    process.exit(1)
  }

  if (normalized !== raw.trim()) {
    console.warn(
      `CLOUDFLARE_PROJECT_NAME normalizzato: ${JSON.stringify(raw)} → ${JSON.stringify(normalized)}`,
    )
  }

  return normalized
}

const workerName = sanitizeWorkerName(projectName)

const configPath = new URL('../wrangler.jsonc', import.meta.url)
const raw = readFileSync(configPath, 'utf8')
const updated = raw.replace(
  /"name"\s*:\s*"[^"]*"/,
  `"name": ${JSON.stringify(workerName)}`,
)

if (!/"workers_dev"\s*:\s*true/.test(updated)) {
  console.error('wrangler.jsonc deve contenere workers_dev: true')
  process.exit(1)
}

writeFileSync(configPath, updated)
console.log(`wrangler name impostato su ${workerName}`)
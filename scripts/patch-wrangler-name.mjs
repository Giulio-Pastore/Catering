import { readFileSync, writeFileSync } from 'node:fs'

const projectName = process.argv[2]
if (!projectName?.trim()) {
  console.error('Usage: node scripts/patch-wrangler-name.mjs <CLOUDFLARE_PROJECT_NAME>')
  process.exit(1)
}

const configPath = new URL('../wrangler.jsonc', import.meta.url)
const raw = readFileSync(configPath, 'utf8')
const updated = raw.replace(
  /"name"\s*:\s*"[^"]*"/,
  `"name": ${JSON.stringify(projectName.trim())}`,
)

if (!/"workers_dev"\s*:\s*true/.test(updated)) {
  console.error('wrangler.jsonc deve contenere workers_dev: true')
  process.exit(1)
}

writeFileSync(configPath, updated)
console.log(`wrangler name impostato su ${projectName.trim()}`)
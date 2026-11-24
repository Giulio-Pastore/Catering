# Convivio · Catering

Web app React + Vite per prenotare un servizio di catering, con API mock in-memory su Cloudflare Worker (Static Assets + SPA).

## Sviluppo locale

```bash
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

Imposta `ADMIN_TOKEN` in `.dev.vars` (stesso valore usato nel form `/admin`).

## Script

- `npm run dev` — Vite + Worker locale (`@cloudflare/vite-plugin`)
- `npm run build` — typecheck + build `dist/`
- `npm run deploy` — build + `wrangler deploy`

## GitHub Actions

Secrets richiesti:

| Secret | Uso |
|--------|-----|
| `CLOUDFLARE_ACCOUNT_ID` | Account Cloudflare |
| `CLOUDFLARE_API_TOKEN` | Deploy Worker (template **Edit Cloudflare Workers**, scope account) |
| `CLOUDFLARE_PROJECT_NAME` | Nome Worker (es. `convivio-catering` o `catering`). In CI viene **normalizzato** in minuscolo con trattini (`Catering` → `catering`); caratteri non validi bloccano il build |
| `ADMIN_TOKEN` | Password admin (`Authorization: Bearer` + gate UI) |

Il workflow [`deploy.yml`](./.github/workflows/deploy.yml) parte **solo a mano** (GitHub → Actions → *Deploy Cloudflare Worker* → *Run workflow*).

Passi: `patch-wrangler-name` → build → individua `dist/*/wrangler.json` (il nome cartella segue `CLOUDFLARE_PROJECT_NAME`, non è sempre `convivio_catering`) → `wrangler secret put ADMIN_TOKEN` → `wrangler deploy`.

### Permessi token Cloudflare

Template consigliato: **Edit Cloudflare Workers**, limitato al **tuo account**. Per questa v1 **non serve D1** né Cloudflare Pages.

## Architettura dati

- Frontend → `src/lib/api-client.ts` → `/api/*`
- Worker → `worker/repositories/memory-catering-repository.ts` (in-memory, seed iniziale)
- Interfaccia `CateringRepository` pronta per D1 / Supabase

Vedi [`PLAN.md`](./PLAN.md) per il piano funzionale completo.
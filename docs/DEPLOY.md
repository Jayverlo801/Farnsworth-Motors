# Deploy — Cloudflare Workers via OpenNext

The site targets Cloudflare using `@opennextjs/cloudflare` (configured in
`open-next.config.ts` + `wrangler.jsonc`).

## One-time setup

```bash
npx wrangler login
```

## Deploy

```bash
npm run deploy      # opennextjs-cloudflare build && deploy
```

## Local Workers preview

```bash
npm run preview     # builds and serves through workerd locally
```

`npm run dev` remains the ordinary Next dev server for day-to-day work.

## Environment variables

Set in the Cloudflare dashboard (Workers → Settings → Variables) or
`wrangler.jsonc` `vars`:

| Var | Purpose |
| --- | --- |
| `VEHICLE_SOURCE` | `supabase` to switch off the static inventory source |
| `SUPABASE_URL` | `https://<project>.supabase.co` |
| `SUPABASE_ANON_KEY` | anon key (read-only; RLS allows select only) |

Apply `supabase/schema.sql` to the project before switching the source.

## Images

`next.config.ts` sets `images.unoptimized` — the Workers runtime has no
default Next image optimizer and current imagery is local/SVG. When real
photography lands, wire a Cloudflare Images loader (`images.loader:
"custom"`) and remove the flag.

## Notes

- `next build` is the source of truth for CI; run it before deploying.
- The 3D build ships `public/3d/**` (models, poster). Those are static
  assets and deploy with everything else — keep the wire-size budgets in
  docs/HERO-CONTRACT.md and the Codex brief.

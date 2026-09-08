# Farnsworth Motors

Utah used vehicle dealership specializing in rebuilt / branded-title vehicles.

**Positioning:** Rebuilt right. Shown completely.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS v4 · Framer Motion · Geist
- Data layer with swappable sources (static JSON today, Supabase adapter ready — supabase/schema.sql)
- Cloudflare Workers deploy via @opennextjs/cloudflare (docs/DEPLOY.md)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/app/            # App Router routes and layouts
public/             # Static assets (images, favicons)
docs/               # Internal documentation
assets/brand/       # Brand guidelines, logos, color specs
.github/workflows/  # CI/CD
```

## Hero & 3D handoff

The hero is orchestrated by src/components/hero/Hero.tsx against the shared
contract in docs/HERO-CONTRACT.md. The 3D build (Codex) owns
src/components/hero/three/** and public/3d/**; everything else is the page
build. The SVG fallback (HeroFallback.tsx) is a permanent deliverable, not a
placeholder. Decisions log: docs/DECISIONS.md.

## Brand

- **Palette:** graphite `#0B0B0C` ground, muted metallic silver accent `#B8BCC4`, warm sweep `#CFC6B8` (v2 direction — supersedes the earlier oxide-red brand book)
- **Type:** Geist + Geist Mono — anything in mono is a fact
- Reference docs live at the repo root (Farnsworth-Homepage-Prompts-v2.md)

## Environment Variables

Copy `.env.example` to `.env.local` and fill in real values. `.env*` files are
git-ignored — never commit secrets.

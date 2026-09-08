# Farnsworth Motors

Utah used vehicle dealership specializing in rebuilt / branded-title vehicles.

**Positioning:** Rebuilt right. Shown completely.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS
- ESLint

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

## Brand

- **Accent:** Oxide Red `#B33A26`
- **Type stack:** Bitter (display) / Archivo (UI) / IBM Plex Mono (data)
- Full guidelines live in `assets/brand/`

## Environment Variables

Copy `.env.example` to `.env.local` and fill in real values. `.env*` files are
git-ignored — never commit secrets.

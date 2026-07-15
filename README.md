# Goodturn

Goodturn Company Limited — freelance work platform: **Goodturn Jobs** (live),
**Goodturn Connect** and **Goodturn Learn** (coming soon).

## Stack

Next.js 15 (App Router, TypeScript) · Tailwind CSS v4 · Prisma + SQLite ·
Auth.js (credentials) · Zod · Vitest

## Getting started

Requires Node.js ≥ 18.18 (tested on 22.x).

```bash
npm install
npx prisma migrate dev   # creates prisma/dev.db
npm run db:seed          # categories + demo data
npm run dev              # http://localhost:3000
```

Create `.env.local` with `AUTH_SECRET=<any long random string>` (generate:
`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`).

## Demo accounts

`alice@example.com`, `bob@example.com`, `carol@example.com` — password `demo1234`.

## Scripts

- `npm run dev` — dev server
- `npm test` — Vitest unit tests (business rules, validation, matching)
- `npm run build` — production build
- `npm run db:migrate` / `npm run db:seed` — database

## Roadmap (later phases)

Payments & escrow (Visa/Mastercard/PayPal/Mpesa/crypto), Goodturn Connect
messaging, Goodturn Learn courses, forum, AI matching. See
`docs/superpowers/specs/2026-07-14-goodturn-website-design.md`.

# TrustPay UI (pass 1: foundation + app shell + dashboard)
Run: `npm i && npm run dev` → /dashboard
- Tokens: `tailwind.config.ts` (sampled from the dashboard export; `warn/warnbg/dangerbg/danger` are DERIVED, not in the design).
- Raleway via next/font with lining numerals forced (Raleway defaults to old-style digits).
- Logo: `public/trustpay-mark.png` is the supplied JPG cut out at native proportions. Please send an SVG for production-sharp rendering.
- Avatars are initials (no photos supplied). Data in `src/lib/mock.ts`.
Pending: landing, auth screens, and the remaining app pages.

## Data layer (Prisma + PostgreSQL)
Setup (Neon or any Postgres):
1. `cp .env.example .env` and fill `DATABASE_URL` (pooled) and `DIRECT_URL` (direct).
2. `npm install` (runs `prisma generate`)
3. `npm run db:init` — generates the init migration from `schema.prisma`, appends `prisma/constraints.sql`
   (partial unique indexes + CHECK constraints), then applies it.
4. `npm run db:seed` — demo data (David as client; all passwords `TrustPay123!`).
After the first run, schema changes use `npm run db:migrate`; production uses `npm run db:deploy`.

Notes
- Prisma is pinned to v6 (this schema uses `url`/`directUrl` in the datasource block).
- Partial indexes aren't modeled by Prisma. After `db:init`, run `npx prisma migrate dev` once more: if it proposes
  dropping any `one_*` index, edit that generated migration to remove the DROP.
- `src/lib/state.ts` holds the allowed milestone/payment/payout transitions; services will enforce actors + compare-and-set.
- Webhooks never insert Payment/Payout rows; they only update rows our server created.

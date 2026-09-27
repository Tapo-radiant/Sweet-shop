# Solhustle Frontend

> Monochrome editorial frontend for **Solhustle** — a trustless Solana escrow
> freelance marketplace. Strictly black & charcoal, serif display headings,
> zero color. Companion to the backend at
> [`ikio-nen/Solhustle`](https://github.com/ikio-nen/Solhustle).

## Stack

- **React 19 + TypeScript + Vite** — fast, typed, no legacy baggage
- **Tailwind CSS v4** — design tokens in `src/index.css`
- **react-router** — hash routing, deploys anywhere static

## Pages

| Route     | Purpose                                                        |
| --------- | -------------------------------------------------------------- |
| `/#/`     | Landing — hero, escrow lifecycle, architecture matrix, reputation |
| `/#/buyer`  | Post contracts, USD→SOL quoting, contract pipelines            |
| `/#/seller` | Funded-job marketplace, applications, earnings, leaderboard    |
| `/#/admin`  | Health, escrow reconciliation, dispute queue, users            |

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run typecheck
```

## Wire the live backend

The UI ships with a realistic mock dataset (`src/data/mock.ts`). To point it
at the real Solhustle API, create `.env.local`:

```env
VITE_API_URL=https://solhustle.xyz
```

`src/lib/api.ts` then prefers live endpoints and falls back to mocks on
failure. (The backend also needs CORS enabled for this origin.)

## Design system

- Page `#0A0A0A` · cards `#151515` · borders `#2A2A2A` · text `#F2F1ED`
- **Fraunces** for display headings (editorial serif), **Inter** for UI,
  **JetBrains Mono** for wallets, signatures, and lamports
- Status is communicated by *treatment*, not color: filled = settled,
  outlined = in-flight, dim = closed, struck = contested

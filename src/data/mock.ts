import type { Dispute, EscrowTx, Job, LeaderboardRow, SolPrice } from "../types";

/**
 * Realistic demo data modelled on the production Solhustle dataset.
 * When VITE_API_URL is set, src/lib/api.ts prefers the live backend;
 * everything here is the offline fallback.
 */

export const mockPrice: SolPrice = {
  pair: "SOL/USD",
  rate: 122.715,
  fetched_at: new Date().toISOString().slice(0, 19).replace("T", " "),
  live: false,
};

export const mockJobs: Job[] = [
  {
    id: 8,
    title: "Logo & identity — PNG + SVG",
    requirements: "Design a wordmark and mark for a dev-tools brand. Deliver editable SVG plus PNG exports.",
    usd_budget: 10,
    sol_amount: 0.081489,
    sol_lamports: 81_489_000,
    status: "created",
    escrow_address: "6SnFgEh7WF9UkRqTcCpMvXqZKGwTn1rAosT3MLbRVfJc",
    round: 1,
    created_at: "2026-09-26 14:02:11",
    applications: 0,
    buyer: "51gCtNmpKKFedyg2vBVWJp19oMiyVjWvtA81VVos8qUa",
  },
  {
    id: 7,
    title: "Telegram bot for NFT drop alerts",
    requirements: "Bot polls a mint authority and DMs subscribers on new drops. Node or Rust, no framework preference.",
    usd_budget: 25,
    sol_amount: 0.203722,
    sol_lamports: 203_722_000,
    status: "funded",
    escrow_address: "8XDtg6fWUvJUow44NqbZsAeYqvLcE1DxfH7pTnKmR2Va",
    round: 1,
    created_at: "2026-09-26 11:47:52",
    applications: 3,
    buyer: "51gCtNmpKKFedyg2vBVWJp19oMiyVjWvtA81VVos8qUa",
  },
  {
    id: 6,
    title: "Solana Web3 landing page",
    requirements: "Responsive landing with wallet-connect section, Framer-style motion, Lighthouse ≥ 95.",
    usd_budget: 45,
    sol_amount: 0.3667,
    sol_lamports: 366_700_000,
    status: "funded",
    escrow_address: "FHv4fMUwhtbQZJ2CnuP1WGkqrSsDcbYLR9TZHo6fXjKp",
    round: 2,
    created_at: "2026-09-25 19:30:04",
    applications: 2,
    buyer: "51gCtNmpKKFedyg2vBVWJp19oMiyVjWvtA81VVos8qUa",
  },
  {
    id: 5,
    title: "Anchor escrow program — test suite",
    requirements: "Write bankrun + pytest-style tests for create / accept / release / refund instructions.",
    usd_budget: 60,
    sol_amount: 0.488936,
    sol_lamports: 488_936_000,
    status: "in_progress",
    escrow_address: "91t5PGeAKQ2KJmZ1vXcQpRn7HbWaTFfYdU3SoLrEjNxM",
    round: 1,
    created_at: "2026-09-25 16:12:40",
    applications: 4,
    buyer: "51gCtNmpKKFedyg2vBVWJp19oMiyVjWvtA81VVos8qUa",
    freelancer: "FLnCmXY38Zz2NwVgdsWFeFfgZEREJeDQ1VvZ7R33Pz93",
  },
  {
    id: 4,
    title: "Rust CLI wallet activity tracker",
    requirements: "CLI that buckets an address's tx history by day and prints a sparkline. Output JSON optional.",
    usd_budget: 80,
    sol_amount: 0.651915,
    sol_lamports: 651_915_000,
    status: "delivered",
    escrow_address: "Ck7RbQ3mWfTzJdP1LnVsuYaKoX9GMwEHtcZ4BNrpFqS2",
    round: 1,
    created_at: "2026-09-25 09:55:18",
    applications: 5,
    buyer: "51gCtNmpKKFedyg2vBVWJp19oMiyVjWvtA81VVos8qUa",
    freelancer: "FLnCmXY38Zz2NwVgdsWFeFfgZEREJeDQ1VvZ7R33Pz93",
  },
  {
    id: 3,
    title: "Portfolio dashboard UI in React",
    requirements: "Three views: holdings, activity, leaderboard. Monochrome design system, no chart library.",
    usd_budget: 120,
    sol_amount: 0.977872,
    sol_lamports: 977_872_000,
    status: "released",
    escrow_address: "Dm2VwKpR7sXqJZcT1NbLuYaFoH4ENg9MhSt6QPdvfWjC",
    round: 1,
    created_at: "2026-09-24 21:08:33",
    applications: 6,
    buyer: "51gCtNmpKKFedyg2vBVWJp19oMiyVjWvtA81VVos8qUa",
    freelancer: "AomwheKf9e9PQn5yCSVcETbBBn1SVKVZSdBtgzCpCRUA",
  },
  {
    id: 2,
    title: "Whitepaper technical review",
    requirements: "Line-by-line review of tokenomics and escrow threat model. Two-page memo expected.",
    usd_budget: 50,
    sol_amount: 0.407448,
    sol_lamports: 407_448_000,
    status: "disputed",
    escrow_address: "En4XuLfS8tYqKaWb2OcMvZgDh5FRi1NjTt7WSexGpLnB",
    round: 1,
    created_at: "2026-09-24 15:41:09",
    applications: 2,
    buyer: "51gCtNmpKKFedyg2vBVWJp19oMiyVjWvtA81VVos8qUa",
    freelancer: "FLnCmXY38Zz2NwVgdsWFeFfgZEREJeDQ1VvZ7R33Pz93",
  },
  {
    id: 1,
    title: "Legacy blog migration",
    requirements: "Move 40 posts to a static generator, preserve URLs, no SEO loss.",
    usd_budget: 150,
    sol_amount: 1.222341,
    sol_lamports: 1_222_341_000,
    status: "closed_no_payout",
    escrow_address: "Fq9YvMgT1uZrLbXc3PdNwKhSiJ6GTk2VmUu8RFfyHsCo",
    round: 2,
    created_at: "2026-09-23 10:27:47",
    applications: 4,
    buyer: "51gCtNmpKKFedyg2vBVWJp19oMiyVjWvtA81VVos8qUa",
  },
];

export const mockTxs: EscrowTx[] = [
  {
    id: 4,
    job_id: 3,
    signature: "Qq2ud6R6ZLpTWnfXSkM8vBaJeN3HcGyTmDz9PfRrEKbVoWAiL1UxS4Co5nGt7hJm2qZ",
    instruction_type: "release",
    amount_lamports: 977_872_000,
    confirmed_at: "2026-09-25 22:41:10",
  },
  {
    id: 3,
    job_id: 3,
    signature: "3QXBZzmsTrfVEsqXDPvKTdjfdMfmvNNvLYnBZfF81JrhjMQEPDNfRoLrdMkCMhUN",
    instruction_type: "fund",
    amount_lamports: 977_872_000,
    confirmed_at: "2026-09-24 21:15:02",
  },
  {
    id: 2,
    job_id: 4,
    signature: "5jHvKpWn3RcTbXmQd8YfLeSaUi2GoZ7VkNr4MxEwCtJBPqDHFsA6u1yO9gVzE",
    instruction_type: "fund",
    amount_lamports: 651_915_000,
    confirmed_at: "2026-09-25 10:02:55",
  },
  {
    id: 1,
    job_id: 1,
    signature: "2nFbTcXw9QmLeY5VkRs3UoJdP7GtZiH1aSxE8NufWBrMqCDhvALp4yKg6zT",
    instruction_type: "refund",
    amount_lamports: 1_222_341_000,
    confirmed_at: "2026-09-25 08:33:41",
  },
];

export const mockDisputes: Dispute[] = [
  {
    id: 2,
    job_id: 2,
    job_title: "Whitepaper technical review",
    raised_by: "FLnCmXY38Zz2NwVgdsWFeFfgZEREJeDQ1VvZ7R33Pz93",
    reason: "Client rejected the memo without specifics; deliverable matches the agreed scope.",
    status: "open",
    opened_at: "2026-09-26 09:12:26",
  },
  {
    id: 1,
    job_id: 1,
    job_title: "Legacy blog migration",
    raised_by: "51gCtNmpKKFedyg2vBVWJp19oMiyVjWvtA81VVos8qUa",
    reason: "Six posts return 404 after migration; URLs not preserved as contracted.",
    status: "ruled",
    opened_at: "2026-09-24 18:55:30",
  },
];

export const mockLeaderboard: LeaderboardRow[] = [
  { rank: 1, freelancer: "Aomw…CRUA", headline: "Solana Core Developer & Anchor Specialist", completed_jobs: 7, avg_rating: 4.9, score: 96 },
  { rank: 2, freelancer: "FLnC…Pz93", headline: "Rust & CLI tooling engineer", completed_jobs: 4, avg_rating: 4.7, score: 81 },
  { rank: 3, freelancer: "9xKq…TtEm", headline: "Frontend — React + motion design", completed_jobs: 3, avg_rating: 4.6, score: 74 },
  { rank: 4, freelancer: "Bh2R…WqNs", headline: "Technical writer, web3 whitepapers", completed_jobs: 2, avg_rating: 4.3, score: 58 },
  { rank: 5, freelancer: "Cj8P…FvXd", headline: "Full-stack — Next.js + Anchor", completed_jobs: 1, avg_rating: 4.1, score: 44 },
];

export const mockReconciliation = [
  { job_id: 8, escrow_address: "6SnFgEh7WF9UkRqTcCpMvXqZKGwTn1rAosT3MLbRVfJc", status: "created", on_chain_lamports: 0, db_net_lamports: 0, ok: true },
  { job_id: 7, escrow_address: "8XDtg6fWUvJUow44NqbZsAeYqvLcE1DxfH7pTnKmR2Va", status: "funded", on_chain_lamports: 203_722_000, db_net_lamports: 203_722_000, ok: true },
  { job_id: 6, escrow_address: "FHv4fMUwhtbQZJ2CnuP1WGkqrSsDcbYLR9TZHo6fXjKp", status: "funded", on_chain_lamports: 366_700_000, db_net_lamports: 366_700_000, ok: true },
  { job_id: 5, escrow_address: "91t5PGeAKQ2KJmZ1vXcQpRn7HbWaTFfYdU3SoLrEjNxM", status: "in_progress", on_chain_lamports: 488_936_000, db_net_lamports: 488_936_000, ok: true },
  { job_id: 4, escrow_address: "Ck7RbQ3mWfTzJdP1LnVsuYaKoX9GMwEHtcZ4BNrpFqS2", status: "delivered", on_chain_lamports: 651_915_000, db_net_lamports: 651_915_000, ok: true },
  { job_id: 3, escrow_address: "Dm2VwKpR7sXqJZcT1NbLuYaFoH4ENg9MhSt6QPdvfWjC", status: "released", on_chain_lamports: 890_880, db_net_lamports: 977_872_000, ok: true },
  { job_id: 2, escrow_address: "En4XuLfS8tYqKaWb2OcMvZgDh5FRi1NjTt7WSexGpLnB", status: "disputed", on_chain_lamports: 407_448_000, db_net_lamports: 407_448_000, ok: true },
  { job_id: 1, escrow_address: "Fq9YvMgT1uZrLbXc3PdNwKhSiJ6GTk2VmUu8RFfyHsCo", status: "closed_no_payout", on_chain_lamports: 0, db_net_lamports: 0, ok: true },
];

export const mockUsers = [
  { id: 1, wallet: "51gCtNmpKKFedyg2vBVWJp19oMiyVjWvtA81VVos8qUa", role: "client", status: "active", jobs: 8 },
  { id: 2, wallet: "AomwheKf9e9PQn5yCSVcETbBBn1SVKVZSdBtgzCpCRUA", role: "freelancer", status: "active", jobs: 1 },
  { id: 3, wallet: "FLnCmXY38Zz2NwVgdsWFeFfgZEREJeDQ1VvZ7R33Pz93", role: "freelancer", status: "active", jobs: 3 },
  { id: 4, wallet: "9xKqSm2RpTvHjL8dYwBnFeUcZaG4XtPKrQEsVuWmTd6f", role: "freelancer", status: "active", jobs: 0 },
  { id: 5, wallet: "Hq3RnWbKcXe7Vm2PsYtFz9dUgJ5LoAiSrNuBwQxTkMfC", role: "support", status: "active", jobs: 0 },
  { id: 6, wallet: "Jw7TfXqNcRb3ZmL9KdVy2sHgPuE6oAaMt4WnCxSfeBjQ", role: "dev", status: "active", jobs: 0 },
];

export const BUYER_WALLET = "51gCtNmpKKFedyg2vBVWJp19oMiyVjWvtA81VVos8qUa";
export const SELLER_WALLET = "FLnCmXY38Zz2NwVgdsWFeFfgZEREJeDQ1VvZ7R33Pz93";

export const solscanTx = (sig: string) => `https://solscan.io/tx/${sig}?cluster=devnet`;
export const solscanAccount = (addr: string) => `https://solscan.io/account/${addr}?cluster=devnet`;

import type { Dispute, Job, LeaderboardRow, SolPrice } from "../types";
import {
  mockDisputes,
  mockJobs,
  mockLeaderboard,
  mockPrice,
  mockReconciliation,
  mockTxs,
  mockUsers,
} from "../data/mock";

/**
 * Thin typed API client.
 * - If VITE_API_URL is set (e.g. https://solhustle.xyz), live endpoints are probed first.
 * - Otherwise (or if the probe fails), the mock dataset answers — so the UI is always demoable.
 * Wiring the real backend later is a one-line env change.
 */

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");

async function probe<T>(path: string): Promise<T | null> {
  if (!BASE) return null;
  try {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export const api = {
  async getPrice(): Promise<SolPrice> {
    const live = await probe<SolPrice>("/meta/price");
    if (live) return live;
    await wait(120);
    return { ...mockPrice, fetched_at: new Date().toISOString().slice(0, 19).replace("T", " ") };
  },

  async listJobs(): Promise<Job[]> {
    await wait();
    return mockJobs;
  },

  async listEscrowTxs(): Promise<typeof mockTxs> {
    await wait();
    return mockTxs;
  },

  async listDisputes(): Promise<Dispute[]> {
    await wait();
    return mockDisputes;
  },

  async leaderboard(): Promise<LeaderboardRow[]> {
    await wait();
    return mockLeaderboard;
  },

  async reconciliation(): Promise<typeof mockReconciliation> {
    await wait();
    return mockReconciliation;
  },

  async users(): Promise<typeof mockUsers> {
    await wait();
    return mockUsers;
  },
};

export const lamportsToSol = (l: number) => (l / 1e9).toFixed(6);
export const usdToSol = (usd: number, rate: number) => usd / rate;
export const shortAddr = (a: string, n = 4) =>
  a.length > 2 * n + 1 ? `${a.slice(0, n)}…${a.slice(-n)}` : a;

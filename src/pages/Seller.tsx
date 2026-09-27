import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SectionHeading from "../components/SectionHeading";
import StatCard from "../components/StatCard";
import JobCard from "../components/JobCard";
import usePrice from "../hooks/usePrice";
import { api } from "../lib/api";
import { SELLER_WALLET, mockLeaderboard } from "../data/mock";
import type { Job } from "../types";

export default function Seller() {
  const price = usePrice();
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [applied, setApplied] = useState<Set<number>>(new Set());

  useEffect(() => {
    api.listJobs().then(setJobs);
  }, []);

  const openJobs = useMemo(
    () => (jobs ?? []).filter((j) => j.status === "funded"),
    [jobs]
  );
  const myActive = useMemo(
    () =>
      (jobs ?? []).filter(
        (j) => j.freelancer === SELLER_WALLET && !["released", "closed_no_payout"].includes(j.status)
      ),
    [jobs]
  );
  const myEarnings = useMemo(
    () => (jobs ?? []).filter((j) => j.freelancer === SELLER_WALLET && j.status === "released"),
    [jobs]
  );

  function apply(jobId: number) {
    setApplied((prev) => new Set(prev).add(jobId));
  }

  return (
    <div className="min-h-screen bg-ink-900">
      <Navbar active="seller" />

      <div className="border-b border-ink-600 bg-ink-850">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-500 font-display text-sm italic text-paper">
              S
            </span>
            <div>
              <p className="font-mono text-xs text-paper">Seller portal</p>
              <p className="mono-xs">freelancer · rank #{mockLeaderboard.find((r) => r.freelancer.startsWith("FLnC"))?.rank ?? 2}</p>
            </div>
          </div>
          <span className="mono-xs">rate {price ? `$${price.rate.toFixed(2)}` : "…"} / SOL</span>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <SectionHeading
          eyebrow="[ freelancer access ]"
          title="Earn in SOL, paid from escrow"
          lede="Every job below already holds locked SOL in an on-chain vault. Apply with proof of skill — payout is guaranteed the moment the client approves."
        />

        <div className="mb-14 grid gap-4 sm:grid-cols-3">
          <StatCard label="Open funded jobs" value={String(openJobs.length)} sub="escrow already locked" />
          <StatCard
            label="Active contracts"
            value={String(myActive.length)}
            sub={(myActive.reduce((a, j) => a + j.sol_lamports, 0) / 1e9).toFixed(4) + " SOL pending"}
          />
          <StatCard
            label="Earned (settled)"
            value={(myEarnings.reduce((a, j) => a + j.sol_lamports, 0) / 1e9).toFixed(4) + " SOL"}
            sub={
              price
                ? "$" + ((myEarnings.reduce((a, j) => a + j.sol_lamports, 0) / 1e9) * price.rate).toFixed(2)
                : "—"
            }
          />
        </div>

        <div className="grid gap-10 lg:grid-cols-5">
          {/* marketplace */}
          <div className="space-y-5 lg:col-span-3">
            <p className="eyebrow">01 · marketplace — funded & open</p>
            {jobs === null ? (
              <div className="card p-10 text-center mono-xs">loading…</div>
            ) : openJobs.length === 0 ? (
              <div className="card p-10 text-center mono-xs">no funded jobs right now — check back soon</div>
            ) : (
              openJobs.map((j) => (
                <div key={j.id} className="space-y-2">
                  <JobCard job={j} />
                  <div className="flex justify-end">
                    {applied.has(j.id) ? (
                      <span className="pill pill-solid">✓ applied</span>
                    ) : (
                      <button className="btn-outline !px-4 !py-2" onClick={() => apply(j.id)}>
                        Apply with proposal
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* side column */}
          <div className="space-y-8 lg:col-span-2">
            <div>
              <p className="eyebrow mb-4">02 · my active work</p>
              <div className="space-y-3">
                {myActive.length === 0 ? (
                  <div className="card p-6 text-center mono-xs">nothing in progress — apply above</div>
                ) : (
                  myActive.map((j) => (
                    <div key={j.id} className="card p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate font-mono text-sm text-paper">#{j.id} {j.title}</p>
                        <span className="mono-xs whitespace-nowrap">{j.status}</span>
                      </div>
                      <button className="btn-outline mt-3 w-full !py-2 !text-xs">
                        Submit delivery ↗
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <p className="eyebrow mb-4">03 · leaderboard</p>
              <ol className="divide-y divide-ink-600 rounded-lg border border-ink-600 bg-ink-800">
                {mockLeaderboard.map((r) => (
                  <li key={r.rank} className="flex items-center gap-4 px-4 py-3">
                    <span className="font-display text-lg font-light italic text-ink-400">{r.rank}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-xs text-paper">{r.freelancer}</p>
                      <p className="truncate text-[11px] text-ink-300">{r.headline}</p>
                    </div>
                    <span className="font-mono text-sm text-paper">{r.score}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

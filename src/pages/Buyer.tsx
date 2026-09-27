import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SectionHeading from "../components/SectionHeading";
import StatCard from "../components/StatCard";
import JobCard from "../components/JobCard";
import usePrice from "../hooks/usePrice";
import { api, usdToSol } from "../lib/api";
import { BUYER_WALLET } from "../data/mock";
import type { Job } from "../types";

export default function Buyer() {
  const price = usePrice();
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState(25);
  const [requirements, setRequirements] = useState("");
  const [posted, setPosted] = useState(false);

  useEffect(() => {
    api.listJobs().then(setJobs);
  }, []);

  const myJobs = useMemo(() => (jobs ?? []).filter((j) => j.buyer === BUYER_WALLET), [jobs]);
  const estSol = price ? usdToSol(budget, price.rate) : null;

  const lockedLamports = myJobs.reduce((acc, j) => {
    const active = !["released", "closed_no_payout"].includes(j.status);
    return active ? acc + j.sol_lamports : acc;
  }, 0);

  function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !requirements.trim()) return;
    setPosted(true);
    setTimeout(() => setPosted(false), 4000);
    setTitle("");
    setRequirements("");
  }

  return (
    <div className="min-h-screen bg-ink-900">
      <Navbar active="buyer" />

      {/* wallet strip */}
      <div className="border-b border-ink-600 bg-ink-850">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-500 font-display text-sm italic text-paper">
              B
            </span>
            <div>
              <p className="font-mono text-xs text-paper">Buyer portal</p>
              <p className="mono-xs">demo · no live wallet attached</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <span className="mono-xs">
              rate {price ? `$${price.rate.toFixed(2)}` : "…"} / SOL
            </span>
            <button className="btn-outline !px-4 !py-2">Request airdrop</button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <SectionHeading
          eyebrow="[ client access ]"
          title="Post a contract & lock escrow"
          lede="Set a USD budget — the oracle converts it to lamports at posting time and the quote is frozen to the contract."
        />

        <div className="mb-14 grid gap-4 sm:grid-cols-3">
          <StatCard label="Open contracts" value={String(myJobs.filter((j) => !["released", "closed_no_payout", "disputed"].includes(j.status)).length)} />
          <StatCard label="SOL in escrow" value={(lockedLamports / 1e9).toFixed(4)} sub="across active contracts" />
          <StatCard label="Released all-time" value={String(myJobs.filter((j) => j.status === "released").length)} sub="settled on devnet" />
        </div>

        <div className="grid gap-10 lg:grid-cols-5">
          {/* ── new contract form ────────────────────────────── */}
          <form onSubmit={handlePost} className="card h-fit p-6 lg:col-span-2">
            <p className="eyebrow mb-5">01 · new contract</p>

            <label className="field-label" htmlFor="job-title">
              Job title
            </label>
            <input
              id="job-title"
              className="field mb-4"
              placeholder="e.g. Build an Anchor staking program"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />

            <label className="field-label" htmlFor="job-budget">
              Budget (USD)
            </label>
            <input
              id="job-budget"
              type="number"
              min={1}
              max={1_000_000}
              className="field mb-2"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
            <p className="mono-xs mb-5">
              ≈ {estSol ? `${estSol.toFixed(6)} SOL` : "…"} at posting time
            </p>

            <label className="field-label" htmlFor="job-reqs">
              Requirements & scope
            </label>
            <textarea
              id="job-reqs"
              rows={5}
              className="field mb-6 resize-y"
              placeholder="Describe the deliverable, acceptance criteria, deadline…"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              maxLength={5000}
            />

            <button type="submit" className="btn-primary w-full">
              {posted ? "✓ Quote locked — contract created" : "Post contract & lock quote"}
            </button>
            <p className="mt-3 text-center text-[11px] text-ink-400">
              Demo mode — connects to the live API once VITE_API_URL is set
            </p>
          </form>

          {/* ── contract list ────────────────────────────────── */}
          <div className="space-y-5 lg:col-span-3">
            <div className="flex items-center justify-between">
              <p className="eyebrow">02 · my contracts</p>
              <button className="btn-ghost">↻ refresh</button>
            </div>
            {jobs === null ? (
              <div className="card p-10 text-center mono-xs">loading…</div>
            ) : (
              myJobs.map((j) => <JobCard key={j.id} job={j} />)
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

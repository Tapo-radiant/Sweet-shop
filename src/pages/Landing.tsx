import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SectionHeading from "../components/SectionHeading";
import usePrice from "../hooks/usePrice";
import { mockLeaderboard } from "../data/mock";

const PHASES = [
  {
    n: "I",
    title: "Post & price",
    body: "A client describes the deliverable and sets a USD budget. The Gemini ticker converts it to an exact lamport amount and locks the quote to the contract.",
  },
  {
    n: "II",
    title: "Lock escrow",
    body: "The client signs a SystemProgram.transfer client-side. SOL moves into a dedicated on-chain vault account — visible to anyone on Solscan.",
  },
  {
    n: "III",
    title: "Work & deliver",
    body: "Freelancers apply with proof of skill. The chosen one delivers milestones with attachment links; the client reviews each version.",
  },
  {
    n: "IV",
    title: "Release or refund",
    body: "Approval releases the vault to the freelancer's wallet. Rejection or a ruled dispute routes funds back — money is never stranded.",
  },
];

const MATRIX = [
  ["Settlement", "Solana Devnet transfers", "Anchor PDA escrow program"],
  ["Custody", "Isolated vault accounts", "Program Derived Addresses"],
  ["Signing", "In-browser Ed25519", "Phantom / Solflare adapter"],
  ["Price feed", "Gemini public ticker", "Pyth on-chain oracle"],
];

export default function Landing() {
  const price = usePrice();

  return (
    <div className="min-h-screen bg-ink-900">
      <Navbar active="home" />

      {/* ── hero ─────────────────────────────────────────────── */}
      <section className="border-b border-ink-600">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <p className="eyebrow mb-6">Solana escrow · freelance marketplace</p>
          <h1 className="max-w-4xl font-display text-5xl font-light leading-[1.05] tracking-tight text-paper sm:text-7xl">
            Trust, enforced by <em className="font-medium">code</em> — not by a
            company.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-200">
            Solhustle holds a client's SOL in an on-chain vault until the work is
            delivered and approved. No chargebacks, no frozen accounts, no
            middleman deciding who is right — just cryptography and a public
            ledger.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link to="/buyer" className="btn-primary">
              Post a contract →
            </Link>
            <Link to="/seller" className="btn-outline">
              Find work
            </Link>
          </div>

          <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-ink-600 bg-ink-600 sm:grid-cols-4">
            {[
              ["Network", "Solana Devnet"],
              ["Oracle", price ? `$${price.rate.toFixed(2)} / SOL` : "…"],
              ["Settlement", "Direct wallet-to-wallet"],
              ["Platform fee", "0% during beta"],
            ].map(([k, v]) => (
              <div key={k} className="bg-ink-850 p-5">
                <dt className="eyebrow mb-1.5">{k}</dt>
                <dd className="font-mono text-sm text-paper">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── lifecycle ────────────────────────────────────────── */}
      <section className="border-b border-ink-600 bg-ink-850">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeading
            eyebrow="How it works"
            title="Four phases, one escrow vault"
            lede="Every contract follows the same lifecycle. Each phase maps to a real instruction on Solana — not to a promise in a database."
          />
          <div className="grid gap-px overflow-hidden rounded-lg border border-ink-600 bg-ink-600 sm:grid-cols-2 lg:grid-cols-4">
            {PHASES.map((p) => (
              <div key={p.n} className="bg-ink-900 p-6">
                <p className="font-display text-4xl font-light italic text-ink-400">{p.n}</p>
                <h3 className="mt-4 font-display text-xl font-medium text-paper">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-300">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── matrix ───────────────────────────────────────────── */}
      <section className="border-b border-ink-600">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeading
            eyebrow="Architecture"
            title="Where the product is, and where it goes"
            lede="Phase one ships real devnet escrow with in-browser signing. Phase two replaces the vault keypair with a trustless Anchor program."
          />
          <div className="overflow-x-auto rounded-lg border border-ink-600">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink-600 bg-ink-850">
                  <th className="eyebrow px-5 py-3.5">Layer</th>
                  <th className="eyebrow px-5 py-3.5">Phase 1 — current</th>
                  <th className="eyebrow px-5 py-3.5">Phase 2 — roadmap</th>
                </tr>
              </thead>
              <tbody>
                {MATRIX.map(([layer, now, next]) => (
                  <tr key={layer} className="border-b border-ink-600 last:border-0">
                    <td className="px-5 py-4 font-medium text-paper">{layer}</td>
                    <td className="px-5 py-4 text-ink-200">{now}</td>
                    <td className="px-5 py-4 text-ink-300">{next}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── leaderboard strip ────────────────────────────────── */}
      <section className="border-b border-ink-600 bg-ink-850">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHeading
            eyebrow="Reputation"
            title="Freelancers, ranked on-chain history"
            lede="Completion rate, dispute losses, and client ratings compose a single score. Reputation is earned in public."
          />
          <ol className="divide-y divide-ink-600 rounded-lg border border-ink-600 bg-ink-900">
            {mockLeaderboard.slice(0, 5).map((r) => (
              <li key={r.rank} className="flex items-center gap-5 px-5 py-4">
                <span className="font-display text-2xl font-light italic text-ink-400">
                  {r.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm text-paper">{r.freelancer}</p>
                  <p className="truncate text-xs text-ink-300">{r.headline}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="mono-xs">{r.completed_jobs} jobs</p>
                  <p className="mono-xs">{r.avg_rating ? `★ ${r.avg_rating.toFixed(1)}` : "—"}</p>
                </div>
                <span className="font-mono text-lg text-paper">{r.score}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── closing CTA ──────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <p className="eyebrow mb-5">Start</p>
          <h2 className="mx-auto max-w-3xl font-display text-4xl font-light leading-tight tracking-tight text-paper sm:text-5xl">
            Your money, locked in public, released on <em className="font-medium">proof</em>.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/buyer" className="btn-primary">
              Open the buyer portal
            </Link>
            <Link to="/seller" className="btn-outline">
              Open the seller portal
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

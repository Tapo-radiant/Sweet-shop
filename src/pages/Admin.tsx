import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SectionHeading from "../components/SectionHeading";
import StatCard from "../components/StatCard";
import { api, lamportsToSol } from "../lib/api";
import { mockReconciliation } from "../data/mock";

export default function Admin() {
  const [recon, setRecon] = useState<typeof mockReconciliation | null>(null);
  const [disputes, setDisputes] = useState<ReturnType<typeof api.listDisputes> extends Promise<infer T> ? T : never>([] as never);
  const [users, setUsers] = useState<Awaited<ReturnType<typeof api.users>> | null>(null);
  const [txs, setTxs] = useState<Awaited<ReturnType<typeof api.listEscrowTxs>> | null>(null);

  useEffect(() => {
    api.reconciliation().then(setRecon);
    api.listDisputes().then(setDisputes);
    api.users().then(setUsers);
    api.listEscrowTxs().then(setTxs);
  }, []);

  const mismatched = recon?.filter((r) => !r.ok).length ?? 0;

  return (
    <div className="min-h-screen bg-ink-900">
      <Navbar active="admin" />

      <div className="border-b border-ink-600 bg-ink-850">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-500 font-display text-sm italic text-paper">
              A
            </span>
            <div>
              <p className="font-mono text-xs text-paper">Admin & settlements</p>
              <p className="mono-xs">dev · full access</p>
            </div>
          </div>
          <span className="mono-xs">rpc devnet · slot ~pending</span>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <SectionHeading
          eyebrow="[ dev access ]"
          title="System health & arbitration"
          lede="Every escrow vault is checked against the chain. Disputes route here with the full evidence bundle attached."
        />

        <div className="mb-14 grid gap-4 sm:grid-cols-4">
          <StatCard label="Reconciliation" value={mismatched === 0 ? "OK" : `${mismatched} off`} sub="vaults vs ledger" />
          <StatCard label="Open disputes" value={String(disputes.filter((d) => d.status === "open").length)} sub="awaiting ruling" />
          <StatCard label="Escrow txs" value={String(txs?.length ?? "…")} sub="recorded on devnet" />
          <StatCard label="Users" value={String(users?.length ?? "…")} sub="registered wallets" />
        </div>

        {/* reconciliation */}
        <section className="mb-14">
          <p className="eyebrow mb-4">01 · escrow reconciliation</p>
          <div className="overflow-x-auto rounded-lg border border-ink-600">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink-600 bg-ink-850">
                  <th className="eyebrow px-4 py-3">Job</th>
                  <th className="eyebrow px-4 py-3">Escrow account</th>
                  <th className="eyebrow px-4 py-3">Status</th>
                  <th className="eyebrow px-4 py-3 text-right">On-chain</th>
                  <th className="eyebrow px-4 py-3 text-right">Ledger</th>
                  <th className="eyebrow px-4 py-3 text-right">Check</th>
                </tr>
              </thead>
              <tbody>
                {(recon ?? []).map((r) => (
                  <tr key={r.job_id} className="border-b border-ink-600 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-paper">#{r.job_id}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-300">{r.escrow_address.slice(0, 8)}…</td>
                    <td className="px-4 py-3 mono-xs">{r.status}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-paper">
                      {lamportsToSol(r.on_chain_lamports)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-ink-300">
                      {lamportsToSol(r.db_net_lamports)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {r.ok ? <span className="pill pill-dim">ok</span> : <span className="pill pill-invert">off</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* disputes */}
        <section className="mb-14">
          <p className="eyebrow mb-4">02 · dispute queue</p>
          <div className="space-y-3">
            {disputes.length === 0 ? (
              <div className="card p-6 text-center mono-xs">queue empty</div>
            ) : (
              disputes.map((d) => (
                <div key={d.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <p className="truncate font-display text-lg font-medium text-paper">
                        <span className="mr-2 font-mono text-xs text-ink-300">#{d.id} · job #{d.job_id}</span>
                        {d.job_title}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-ink-300">{d.reason}</p>
                    <p className="mono-xs mt-2">raised by {d.raised_by.slice(0, 8)}… · {d.opened_at}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {d.status === "open" ? (
                      <>
                        <span className="pill pill-outline">open</span>
                        <button className="btn-outline !px-3 !py-1.5 !text-xs">Review</button>
                      </>
                    ) : (
                      <span className="pill pill-dim">ruled</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* users */}
        <section>
          <p className="eyebrow mb-4">03 · registered wallets</p>
          <div className="overflow-x-auto rounded-lg border border-ink-600">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink-600 bg-ink-850">
                  <th className="eyebrow px-4 py-3">ID</th>
                  <th className="eyebrow px-4 py-3">Wallet</th>
                  <th className="eyebrow px-4 py-3">Role</th>
                  <th className="eyebrow px-4 py-3 text-right">Jobs</th>
                  <th className="eyebrow px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {(users ?? []).map((u) => (
                  <tr key={u.id} className="border-b border-ink-600 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-ink-300">{u.id}</td>
                    <td className="px-4 py-3 font-mono text-xs text-paper">{u.wallet.slice(0, 12)}…</td>
                    <td className="px-4 py-3 mono-xs">{u.role}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-paper">{u.jobs}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={u.status === "active" ? "pill pill-dim" : "pill pill-invert"}>{u.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

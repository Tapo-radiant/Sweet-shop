import StatusPill from "./StatusPill";
import type { Job } from "../types";
import { solscanAccount } from "../data/mock";
import { shortAddr } from "../lib/api";

/** Five-stage contract pipeline; ticks every stage up to the job's current one. */
const STAGES = ["posted", "funded", "working", "delivered", "released"] as const;

function stageIndex(status: Job["status"]): number {
  switch (status) {
    case "created":
      return 0;
    case "funded":
    case "negotiating":
    case "agreed":
      return 1;
    case "in_progress":
      return 2;
    case "delivered":
      return 3;
    case "released":
      return 4;
    default:
      return -1; // rejected / disputed / closed → no ticks
  }
}

export default function JobCard({ job }: { job: Job }) {
  const idx = stageIndex(job.status);
  return (
    <article className="card p-6">
      <div className="mb-3 flex items-start justify-between gap-4">
        <h3 className="font-display text-xl font-medium text-paper">
          <span className="mr-2 font-mono text-sm text-ink-300">#{job.id}</span>
          {job.title}
        </h3>
        <StatusPill status={job.status} />
      </div>

      <p className="mb-5 text-sm leading-relaxed text-ink-300">{job.requirements}</p>

      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="eyebrow mb-1">Budget</p>
          <p className="font-mono text-sm text-paper">${job.usd_budget.toLocaleString()}</p>
        </div>
        <div>
          <p className="eyebrow mb-1">Escrow</p>
          <p className="font-mono text-sm text-paper">{job.sol_amount.toFixed(4)} SOL</p>
        </div>
        <div>
          <p className="eyebrow mb-1">Applicants</p>
          <p className="font-mono text-sm text-paper">{job.applications}</p>
        </div>
        <div>
          <p className="eyebrow mb-1">Round</p>
          <p className="font-mono text-sm text-paper">{job.round}</p>
        </div>
      </div>

      {/* pipeline */}
      <ol className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1">
        {STAGES.map((s, i) => {
          const done = idx >= 0 && i <= idx;
          return (
            <li key={s} className="flex items-center gap-2">
              <span
                className={
                  "font-mono text-[10px] uppercase tracking-[0.15em] " +
                  (done ? "text-paper" : "text-ink-400")
                }
              >
                {done ? "✓ " : ""}
                {s}
              </span>
              {i < STAGES.length - 1 && <span className="text-ink-500">—</span>}
            </li>
          );
        })}
      </ol>

      <div className="flex items-center justify-between border-t border-ink-600 pt-4">
        <a
          className="mono-xs transition-colors hover:text-paper"
          href={solscanAccount(job.escrow_address)}
          target="_blank"
          rel="noreferrer"
        >
          escrow {shortAddr(job.escrow_address)} ↗
        </a>
        <span className="mono-xs">{job.created_at}</span>
      </div>
    </article>
  );
}

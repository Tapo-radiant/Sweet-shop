import type { JobStatus } from "../types";

/** Monochrome status treatment: fill = active, outline = progressing, dim = closed, strike = bad. */
const TREATMENT: Record<JobStatus, string> = {
  created: "pill pill-dim",
  funded: "pill pill-solid",
  negotiating: "pill pill-outline",
  agreed: "pill pill-outline",
  in_progress: "pill pill-outline",
  delivered: "pill pill-outline",
  released: "pill pill-solid",
  rejected: "pill pill-invert",
  disputed: "pill pill-invert",
  held_detached: "pill pill-invert",
  closed_no_payout: "pill pill-dim",
};

const LABEL: Record<JobStatus, string> = {
  created: "created",
  funded: "funded",
  negotiating: "negotiating",
  agreed: "agreed",
  in_progress: "in progress",
  delivered: "delivered",
  released: "released",
  rejected: "rejected",
  disputed: "disputed",
  held_detached: "held",
  closed_no_payout: "closed",
};

export default function StatusPill({ status }: { status: JobStatus }) {
  return <span className={TREATMENT[status] ?? "pill pill-dim"}>{LABEL[status] ?? status}</span>;
}

export type JobStatus =
  | "created"
  | "funded"
  | "negotiating"
  | "agreed"
  | "in_progress"
  | "delivered"
  | "released"
  | "rejected"
  | "closed_no_payout"
  | "disputed"
  | "held_detached";

export type Job = {
  id: number;
  title: string;
  requirements: string;
  usd_budget: number;
  sol_amount: number;
  sol_lamports: number;
  status: JobStatus;
  escrow_address: string;
  round: number;
  created_at: string;
  applications: number;
  buyer: string;
  freelancer?: string | null;
};

export type EscrowTx = {
  id: number;
  job_id: number;
  signature: string;
  instruction_type: "fund" | "release" | "refund";
  amount_lamports: number;
  confirmed_at: string;
};

export type Dispute = {
  id: number;
  job_id: number;
  job_title: string;
  raised_by: string;
  reason: string;
  status: "open" | "ruled";
  opened_at: string;
};

export type LeaderboardRow = {
  rank: number;
  freelancer: string;
  headline: string;
  completed_jobs: number;
  avg_rating: number | null;
  score: number;
};

export type SolPrice = {
  pair: "SOL/USD";
  rate: number;
  fetched_at: string;
  live: boolean;
};

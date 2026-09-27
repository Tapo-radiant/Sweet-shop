export default function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="card p-5">
      <p className="eyebrow mb-2">{label}</p>
      <p className="font-mono text-2xl text-paper">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-300">{sub}</p>}
    </div>
  );
}

export default function SectionHeading({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <div className="mb-10">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="font-display text-3xl font-medium tracking-tight text-paper sm:text-4xl">
        {title}
      </h2>
      {lede && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-300">{lede}</p>}
    </div>
  );
}

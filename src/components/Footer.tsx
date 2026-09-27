export default function Footer() {
  return (
    <footer className="border-t border-ink-600 bg-ink-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-lg italic text-paper">Solhustle</span>
          <span className="mono-xs">trustless escrow · solana devnet</span>
        </div>
        <div className="flex items-center gap-5 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-300">
          <a
            href="https://github.com/ikio-nen/Solhustle"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-paper"
          >
            Backend ↗
          </a>
          <a
            href="https://solscan.io"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-paper"
          >
            Solscan ↗
          </a>
          <span className="text-ink-400">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "react-router-dom";

export default function Navbar({ active }: { active: "home" | "buyer" | "seller" | "admin" }) {
  const link = (to: string, label: string, key: typeof active) => (
    <Link
      to={to}
      className={
        "font-mono text-[11px] uppercase tracking-[0.2em] transition-colors " +
        (active === key ? "text-paper" : "text-ink-300 hover:text-paper")
      }
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-ink-600 bg-ink-900/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold italic tracking-tight text-paper">
            Solhustle
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.25em] text-ink-400 sm:inline">
            escrow · devnet
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          {link("/", "Overview", "home")}
          {link("/buyer", "Buyer", "buyer")}
          {link("/seller", "Seller", "seller")}
          {link("/admin", "Admin", "admin")}
        </nav>
      </div>
    </header>
  );
}

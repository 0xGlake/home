"use client";

import { useHighlight } from "./HighlightContext";

// Header toggle (sits to the left of "Submit a protocol"). When on, the map
// backgrounds every protocol that has a CoinGecko token so they stand out.
export default function HighlightToggle() {
  const { highlight, setHighlight } = useHighlight();

  return (
    <button
      type="button"
      aria-pressed={highlight}
      onClick={() => setHighlight(!highlight)}
      className={`inline-flex h-[30px] items-center gap-2 rounded-md border px-3 font-mono text-sm transition-colors duration-150 ${
        highlight
          ? "border-white/25 bg-white/[0.08] text-zinc-100"
          : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-zinc-200"
      }`}
    >
      <span
        aria-hidden
        className={`h-2 w-2 rounded-full transition-all duration-150 ${
          highlight
            ? "bg-emerald-400 shadow-[0_0_6px_1px_rgba(74,195,138,0.7)]"
            : "bg-zinc-600 ring-1 ring-white/20"
        }`}
      />
      {highlight ? "Tokens shown" : "Highlight tokens"}
    </button>
  );
}

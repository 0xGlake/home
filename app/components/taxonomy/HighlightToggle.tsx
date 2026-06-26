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
      className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-1.5 font-mono text-sm font-medium transition-all duration-150 active:scale-[0.97] ${
        highlight
          ? "border-emerald-400/70 bg-emerald-500/20 text-emerald-100 shadow-sm shadow-emerald-500/20"
          : "border-emerald-500/30 bg-emerald-500/5 text-emerald-300/90 hover:border-emerald-400/50 hover:bg-emerald-500/15 hover:text-emerald-200"
      }`}
    >
      <span
        aria-hidden
        className={`h-2 w-2 rounded-full transition-all duration-150 ${
          highlight
            ? "bg-emerald-300 shadow-[0_0_6px_1px_rgba(110,231,183,0.7)]"
            : "bg-emerald-400/20 ring-1 ring-emerald-400/50"
        }`}
      />
      {highlight ? "Tokens shown" : "Highlight tokens"}
    </button>
  );
}

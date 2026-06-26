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
      className={`rounded-md border px-3 py-1 font-mono text-sm transition-colors ${
        highlight
          ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-200"
          : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200"
      }`}
    >
      {highlight ? "Tokens: on" : "Highlight tokens"}
    </button>
  );
}

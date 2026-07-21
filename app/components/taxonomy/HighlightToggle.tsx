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
      aria-label={highlight ? "Tokens highlighted" : "Highlight tokens"}
      title={highlight ? "Tokens highlighted" : "Highlight tokens"}
      onClick={() => setHighlight(!highlight)}
      className={`inline-flex h-[30px] w-[30px] items-center justify-center gap-0 rounded-md border font-mono text-sm transition-colors duration-150 sm:w-auto sm:gap-2 sm:px-3 ${
        highlight
          ? "border-emerald-400/40 bg-emerald-400/[0.12] text-emerald-300"
          : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-zinc-200"
      }`}
    >
      {/* Coin stack — "highlight tokenised protocols" */}
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
        <ellipse cx="8" cy="4.3" rx="5.2" ry="2.3" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2.8 4.3v3.1c0 1.27 2.33 2.3 5.2 2.3s5.2-1.03 5.2-2.3V4.3" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2.8 7.4v3.1c0 1.27 2.33 2.3 5.2 2.3s5.2-1.03 5.2-2.3V7.4" stroke="currentColor" strokeWidth="1.3" />
      </svg>
      <span className="hidden sm:inline">{highlight ? "Tokens shown" : "Highlight tokens"}</span>
    </button>
  );
}

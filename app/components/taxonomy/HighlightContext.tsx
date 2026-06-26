"use client";

import { createContext, useContext, useState } from "react";

// Shares the "highlight assets that have a token" toggle between the button in the
// page header (HighlightToggle) and the map itself (TaxonomyMasonry adds a class
// that backgrounds every circle carrying `data-token`). A client provider wraps
// both in the page tree so the state crosses the server/client boundary cleanly.
interface HighlightCtx {
  highlight: boolean;
  setHighlight: (v: boolean) => void;
}

const Ctx = createContext<HighlightCtx | null>(null);

export function HighlightProvider({ children }: { children: React.ReactNode }) {
  const [highlight, setHighlight] = useState(false);
  return (
    <Ctx.Provider value={{ highlight, setHighlight }}>{children}</Ctx.Provider>
  );
}

export function useHighlight(): HighlightCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useHighlight must be used within HighlightProvider");
  return ctx;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { PriceMap } from "@/app/api/prices/route";

const REFRESH_MS = 60_000;

// Shares the "highlight assets that have a token" toggle between the button in the
// page header (HighlightToggle) and the map itself (TaxonomyMasonry adds a class
// that colours every circle carrying `data-token`: green when its 24h change is
// non-negative or unknown, red when it's down). The same provider also owns the
// live CoinGecko price feed (fetched via /api/prices) so the map highlight and the
// watchlist panel (TokenTerminal) read one shared, ref-counted source of truth.
interface HighlightCtx {
  highlight: boolean;
  setHighlight: (v: boolean) => void;
  prices: PriceMap | null;
  loading: boolean;
  error: boolean;
  load: () => void;
  acquire: () => void;
  release: () => void;
}

const Ctx = createContext<HighlightCtx | null>(null);

export function HighlightProvider({ children }: { children: React.ReactNode }) {
  const [highlight, setHighlight] = useState(false);
  const [prices, setPrices] = useState<PriceMap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/prices", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setPrices((await res.json()) as PriceMap);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reference-counted polling: any number of consumers (the watchlist panel while
  // open, the highlight toggle while on) ask for live prices. We fetch once for the
  // first subscriber and run a single shared 60s interval until the last leaves.
  const subscribers = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pricesRef = useRef<PriceMap | null>(null);
  pricesRef.current = prices;

  const acquire = useCallback(() => {
    subscribers.current += 1;
    if (subscribers.current > 1) return;
    if (!pricesRef.current) load();
    timer.current = setInterval(load, REFRESH_MS);
  }, [load]);

  const release = useCallback(() => {
    subscribers.current = Math.max(0, subscribers.current - 1);
    if (subscribers.current > 0) return;
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  // Keep prices flowing while the highlight is on so the map colours stay live.
  useEffect(() => {
    if (!highlight) return;
    acquire();
    return release;
  }, [highlight, acquire, release]);

  return (
    <Ctx.Provider
      value={{
        highlight,
        setHighlight,
        prices,
        loading,
        error,
        load,
        acquire,
        release,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useHighlight(): HighlightCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useHighlight must be used within HighlightProvider");
  return ctx;
}

// Subscribe to the shared price feed while `active`. Drives fetch-on-demand plus
// the shared 60s refresh; safe to call from several components at once.
export function usePriceFeed(active: boolean): void {
  const { acquire, release } = useHighlight();
  useEffect(() => {
    if (!active) return;
    acquire();
    return release;
  }, [active, acquire, release]);
}

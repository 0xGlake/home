"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./taxonomy.module.css";
import {
  allGroupIds,
  flatTokens,
  tokenTree,
  type TokenRow,
  type TokenTreeNode,
} from "./tokenList";
import type { PriceMap } from "@/app/api/prices/route";

// Slide-out "terminal" watchlist for the taxonomy page. A burger in the page
// header toggles a docked right-hand panel listing every tokenised protocol with
// its live USD price and 24h change (CoinGecko, via /api/prices).
//
// Two views:
//  • Grouped — the taxonomy rendered as a real, infinitely-nested expandable
//    tree, with an expand-all / collapse-all toggle. Tokens within a node are
//    sorted by 24h change descending.
//  • All — one flat, deduped list sortable by 24h change.
// Users can ★-favourite any asset; favourites pin to a section at the top of both
// views (persisted in localStorage). Every row is a single compact line
// (star · logo · symbol · price · 24h) whose full taxonomy path shows on hover;
// clicking the row opens the coin's CoinGecko page.

const REFRESH_MS = 60_000;
const INDENT = 12; // px added per tree depth
const FAVS_KEY = "taxonomy:favs";
const FAVS_COLLAPSED_KEY = "taxonomy:favsCollapsed";

type View = "grouped" | "all";
type SortDir = "desc" | "asc";

function fmtPrice(n: number | undefined | null): string {
  if (n == null) return "—";
  if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 0.01) return n.toFixed(4);
  return n.toFixed(8).replace(/0+$/, "");
}

function fmtChange(n: number | undefined | null): string {
  if (n == null) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function changeClass(n: number | undefined | null): string {
  if (n == null) return styles.changeFlat;
  if (n > 0) return styles.changeUp;
  if (n < 0) return styles.changeDown;
  return styles.changeFlat;
}

export default function TokenTerminal() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("grouped");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [favs, setFavs] = useState<Set<string>>(() => new Set());
  const [favsCollapsed, setFavsCollapsed] = useState(false);

  const [prices, setPrices] = useState<PriceMap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Hydrate favourites (and their collapsed state) from localStorage after mount
  // — keeps SSR markup stable — then persist on every change. localStorage has no
  // expiry, so favourites survive across browser sessions without a backend.
  const favsReady = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVS_KEY);
      if (raw) setFavs(new Set(JSON.parse(raw) as string[]));
      setFavsCollapsed(localStorage.getItem(FAVS_COLLAPSED_KEY) === "1");
    } catch {}
    favsReady.current = true;
  }, []);
  useEffect(() => {
    if (!favsReady.current) return;
    try {
      localStorage.setItem(FAVS_KEY, JSON.stringify([...favs]));
    } catch {}
  }, [favs]);
  useEffect(() => {
    if (!favsReady.current) return;
    try {
      localStorage.setItem(FAVS_COLLAPSED_KEY, favsCollapsed ? "1" : "0");
    } catch {}
  }, [favsCollapsed]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/prices");
      if (!res.ok) throw new Error();
      setPrices((await res.json()) as PriceMap);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    if (!prices) load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [open, prices, load]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const changeOf = useCallback(
    (t: TokenRow) => prices?.[t.priceKey]?.usd_24h_change,
    [prices],
  );

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const toggleFav = (id: string) =>
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allExpanded = expanded.size >= allGroupIds.length;
  const toggleAll = () =>
    setExpanded(allExpanded ? new Set() : new Set(allGroupIds));

  const byChangeDesc = useCallback(
    (a: TokenRow, b: TokenRow) => {
      const av = changeOf(a);
      const bv = changeOf(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return bv - av;
    },
    [changeOf],
  );

  const flatSorted = useMemo(() => {
    const rows = [...flatTokens];
    rows.sort((a, b) => {
      const av = changeOf(a);
      const bv = changeOf(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return rows;
  }, [sortDir, changeOf]);

  const favRows = useMemo(
    () => flatTokens.filter((t) => favs.has(t.priceKey)).sort(byChangeDesc),
    [favs, byChangeDesc],
  );

  const renderRow = (t: TokenRow, depth: number) => {
    const entry = prices?.[t.priceKey];
    const isFav = favs.has(t.priceKey);
    return (
      <a
        key={`${t.path}-${t.priceKey}`}
        className={styles.tkRow}
        style={depth ? { paddingLeft: 12 + depth * INDENT } : undefined}
        href={t.url}
        target="_blank"
        rel="noopener noreferrer"
        title={t.path}
      >
        <button
          type="button"
          className={`${styles.tkStar} ${isFav ? styles.tkStarActive : ""}`}
          aria-label={isFav ? "Unfavourite" : "Favourite"}
          aria-pressed={isFav}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFav(t.priceKey);
          }}
        >
          {isFav ? "★" : "☆"}
        </button>
        <span className={styles.tkLogo}>
          {t.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={t.logo}
              alt=""
              width={16}
              height={16}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
        </span>
        <span className={styles.tkSymbol}>{t.symbol}</span>
        <span className={styles.tkPrice}>{fmtPrice(entry?.usd)}</span>
        <span className={`${styles.tkChange} ${changeClass(entry?.usd_24h_change)}`}>
          {fmtChange(entry?.usd_24h_change)}
        </span>
      </a>
    );
  };

  // Recursive group node: header (caret · name · count) then, when expanded, its
  // direct tokens (sorted by 24h change) followed by nested sub-groups.
  const renderNode = (node: TokenTreeNode, depth: number) => {
    const isOpen = expanded.has(node.id);
    const tokens = isOpen ? [...node.tokens].sort(byChangeDesc) : [];
    return (
      <div key={node.id} className={styles.tkGroup}>
        <button
          type="button"
          className={styles.tkGroupHead}
          data-accent={node.accent}
          style={{ paddingLeft: 12 + depth * INDENT }}
          onClick={() => toggle(node.id)}
          aria-expanded={isOpen}
          title={node.path}
        >
          <span className={styles.tkCaret}>{isOpen ? "▾" : "▸"}</span>
          <span className={styles.tkGroupName}>{node.title}</span>
          <span className={styles.tkGroupCount}>{node.count}</span>
        </button>
        {isOpen && (
          <>
            {tokens.map((t) => renderRow(t, depth + 1))}
            {node.children.map((c) => renderNode(c, depth + 1))}
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open token watchlist"
        aria-pressed={open}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex h-[30px] items-center justify-center rounded-md border px-2.5 font-mono text-sm transition-colors duration-150 ${
          open
            ? "border-white/25 bg-white/[0.08] text-zinc-100"
            : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-zinc-200"
        }`}
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M2 4h12M2 8h12M2 12h12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <aside
        className={`${styles.tkPanel} ${open ? styles.tkPanelOpen : ""}`}
        aria-hidden={!open}
      >
        <header className={styles.tkHeader}>
          <span className={styles.tkTitle}>Markets</span>
          <button
            type="button"
            className={styles.tkRefresh}
            onClick={load}
            disabled={loading}
            title="Refresh prices"
            aria-label="Refresh prices"
          >
            {loading ? "···" : "↻"}
          </button>
          <button
            type="button"
            className={styles.tkClose}
            onClick={() => setOpen(false)}
            aria-label="Close watchlist"
          >
            ✕
          </button>
        </header>

        <div className={styles.tkViewBar}>
          <button
            type="button"
            className={`${styles.tkViewBtn} ${view === "grouped" ? styles.tkViewActive : ""}`}
            onClick={() => setView("grouped")}
          >
            Grouped
          </button>
          <button
            type="button"
            className={`${styles.tkViewBtn} ${view === "all" ? styles.tkViewActive : ""}`}
            onClick={() => setView("all")}
          >
            All
          </button>
        </div>

        {view === "grouped" && (
          <div className={styles.tkSortBar}>
            <button
              type="button"
              className={styles.tkSortBtn}
              onClick={toggleAll}
            >
              {allExpanded ? "Collapse all" : "Expand all"}
            </button>
          </div>
        )}

        {view === "all" && (
          <div className={styles.tkSortBar}>
            <button
              type="button"
              className={`${styles.tkSortBtn} ${styles.tkSortActive}`}
              onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
            >
              24h % {sortDir === "asc" ? "↑" : "↓"}
            </button>
          </div>
        )}

        <div className={styles.tkBody}>
          {error && (
            <div className={styles.tkNotice}>
              Couldn&apos;t load prices.{" "}
              <button type="button" className={styles.tkRetry} onClick={load}>
                Retry
              </button>
            </div>
          )}
          {!error && !prices && loading && (
            <div className={styles.tkNotice}>Loading prices…</div>
          )}

          {favRows.length > 0 && (
            <div className={styles.tkPinned}>
              <button
                type="button"
                className={styles.tkGroupHead}
                data-accent="amber"
                onClick={() => setFavsCollapsed((c) => !c)}
                aria-expanded={!favsCollapsed}
              >
                <span className={styles.tkCaret}>
                  {favsCollapsed ? "▸" : "▾"}
                </span>
                <span className={styles.tkGroupName}>★ Favourites</span>
                <span className={styles.tkGroupCount}>{favRows.length}</span>
              </button>
              {!favsCollapsed && favRows.map((t) => renderRow(t, 0))}
            </div>
          )}

          {view === "grouped" && tokenTree.map((n) => renderNode(n, 0))}
          {view === "all" && flatSorted.map((t) => renderRow(t, 0))}
        </div>

        <footer className={styles.tkFooter}>
          Data: CoinGecko · 24h change · refreshes every 60s
        </footer>
      </aside>
    </>
  );
}

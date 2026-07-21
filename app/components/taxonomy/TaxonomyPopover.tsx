"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./taxonomy.module.css";

// Single delegated action popover for the whole tree. Clicking a protocol circle
// (any element carrying `data-protocol` with a destination) opens a small box
// anchored at the cursor offering the available links — X / Twitter and, when the
// protocol has a token, a CoinGecko button. The box is `position: fixed`, so it
// floats over the page without shifting any layout.
//
// This sits *inside* TaxonomyTooltip in the tree: on a protocol click we
// stopPropagation so the tooltip's click-to-toggle doesn't also fire. Non-protocol
// clicks pass straight through to the tooltip as before.

interface PopoverState {
  x: number;
  y: number;
  id: string; // identity of the trigger (its breadcrumb) — used for toggle-off
  name: string;
  twitter: string | null;
  coingecko: string | null;
  coingeckoNft: string | null;
  ticker: string | null;
  rebrand: string | null;
}

const COINGECKO = "https://www.coingecko.com/en/coins/";
const COINGECKO_NFT = "https://www.coingecko.com/en/nft/";

export default function TaxonomyPopover({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<PopoverState | null>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setState(null), []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Clicks inside the open popover (e.g. the links) shouldn't reopen/close it.
    if (target.closest(`.${styles.popover}`)) return;

    const trigger = target.closest<HTMLElement>("[data-protocol]");
    const twitter = trigger?.dataset.twitter ?? null;
    const coingecko = trigger?.dataset.coingecko ?? null;
    const coingeckoNft = trigger?.dataset.coingeckoNft ?? null;

    if (trigger && (twitter || coingecko || coingeckoNft)) {
      // Keep the tooltip's toggle handler (an ancestor) from firing.
      e.stopPropagation();
      const id = trigger.dataset.path ?? trigger.dataset.name ?? "";
      // Clicking the same asset again dismisses the box.
      if (state && state.id === id) {
        setState(null);
        return;
      }
      setState({
        x: e.clientX,
        y: e.clientY,
        id,
        name: trigger.dataset.name ?? "",
        twitter,
        coingecko,
        coingeckoNft,
        ticker: trigger.dataset.ticker ?? null,
        rebrand: trigger.dataset.rebrand ?? null,
      });
      return;
    }

    // Clicked empty space within the tree — dismiss any open popover and let the
    // event bubble to the tooltip toggle.
    if (state) setState(null);
  }, [state]);

  // Dismiss on a click anywhere outside (covers clicks beyond this wrapper, e.g.
  // the page header) and on Escape. Triggers are handled by handleClick above,
  // so ignore pointerdowns that land on one.
  useEffect(() => {
    if (!state) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest(`.${styles.popover}`)) return;
      if (t.closest("[data-protocol]")) return;
      setState(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setState(null);
    };
    const onScroll = () => setState(null);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [state]);

  // Flip the box back toward the cursor when it'd overflow the right/bottom edges,
  // mirroring the tooltip placement.
  let placement: React.CSSProperties = {};
  if (state) {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1920;
    const vh = typeof window !== "undefined" ? window.innerHeight : 1080;
    const nearRight = state.x > vw - 200;
    const nearBottom = state.y > vh - 140;
    placement = {
      left: state.x + (nearRight ? -8 : 8),
      top: state.y + (nearBottom ? -8 : 8),
      transform: `translate(${nearRight ? "-100%" : "0"}, ${nearBottom ? "-100%" : "0"})`,
    };
  }

  return (
    <div onClick={handleClick}>
      {children}
      {state && (
        <div ref={popRef} className={styles.popover} style={placement}>
          <div className={styles.popoverName}>{state.name}</div>
          {state.rebrand && (
            <div className={styles.popoverRebrand}>
              <span className={styles.popoverRebrandLabel}>rebrand trail</span>
              {state.rebrand}
            </div>
          )}
          {state.twitter && (
            <a
              className={styles.popoverAction}
              href={state.twitter}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
            >
              {/^https?:\/\/(www\.)?(x|twitter)\.com/i.test(state.twitter) ? "X / Twitter" : "Website"}
            </a>
          )}
          {state.coingecko && (
            <a
              className={styles.popoverAction}
              href={`${COINGECKO}${state.coingecko}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
            >
              Token{state.ticker ? ` · ${state.ticker}` : ""}
            </a>
          )}
          {state.coingeckoNft && (
            <a
              className={styles.popoverAction}
              href={`${COINGECKO_NFT}${state.coingeckoNft}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
            >
              NFT · floor
            </a>
          )}
          {(state.coingecko || state.coingeckoNft) && (
            <div className={styles.popoverNote}>
              Ticker &amp; token matched by hand — may be inaccurate.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

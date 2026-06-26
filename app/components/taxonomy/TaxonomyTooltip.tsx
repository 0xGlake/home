"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./taxonomy.module.css";

type Tip = { path: string; desc: string | null; x: number; y: number };

// Single delegated tooltip for the whole tree. Boxes carry `data-path`
// (breadcrumb of ancestor categories) and circles carry the full chain plus an
// optional `data-desc`. On hover we walk up from the event target to the nearest
// element with a `data-path` and render a tooltip that follows the cursor — so
// the server-rendered tree stays static and only this wrapper is a client
// component.
export default function TaxonomyTooltip({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tip, setTip] = useState<Tip | null>(null);
  // Tooltips are on by default; a click anywhere that isn't a protocol link
  // toggles them off/on.
  const [enabled, setEnabled] = useState(true);
  const enabledRef = useRef(true);
  const raf = useRef<number | null>(null);

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!enabledRef.current) return;
    const x = e.clientX;
    const y = e.clientY;
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-path]");
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      if (!el) {
        setTip(null);
        return;
      }
      setTip({ path: el.dataset.path || "", desc: el.dataset.desc ?? null, x, y });
    });
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Let protocol links navigate without toggling.
    if ((e.target as HTMLElement).closest("a")) return;
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    if (!next) {
      if (raf.current) cancelAnimationFrame(raf.current);
      setTip(null);
    }
  }, []);

  const clear = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    setTip(null);
  }, []);

  // Balanced nested multi-column is ~10x more expensive to lay out than a single
  // column. Resizing reflows it every frame → unusable lag. So while the window
  // is actively resizing we collapse to a single column (cheap), then restore
  // the masonry shortly after the user stops.
  const [resizing, setResizing] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      setResizing(true);
      clearTimeout(timer);
      timer = setTimeout(() => setResizing(false), 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(timer);
    };
  }, []);

  // Keep the tooltip on-screen: nudge left of the cursor near the right edge,
  // and above it near the bottom edge.
  let style: React.CSSProperties | undefined;
  if (tip) {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1920;
    const vh = typeof window !== "undefined" ? window.innerHeight : 1080;
    const nearRight = tip.x > vw - 340;
    const nearBottom = tip.y > vh - 140;
    style = {
      left: tip.x + (nearRight ? -14 : 14),
      top: tip.y + (nearBottom ? -16 : 16),
      transform: `translate(${nearRight ? "-100%" : "0"}, ${
        nearBottom ? "-100%" : "0"
      })`,
    };
  }

  return (
    <div
      className={resizing ? styles.resizing : undefined}
      onMouseMove={handleMove}
      onMouseLeave={clear}
      onClick={handleClick}
    >
      {children}
      {tip && (
        <div className={styles.tooltip} style={style}>
          <div className={styles.tooltipPath}>{tip.path}</div>
          {tip.desc && <div className={styles.tooltipDesc}>{tip.desc}</div>}
        </div>
      )}
    </div>
  );
}

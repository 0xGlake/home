"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./taxonomy.module.css";

// Single delegated tooltip for the whole tree. Boxes carry `data-path`
// (breadcrumb of ancestor categories) and circles carry the full chain plus an
// optional `data-desc`. On hover we walk up from the event target to the nearest
// element with a `data-path`.
//
// Performance: the tooltip follows the cursor by writing styles directly to its
// DOM node (no React render per pixel); React state only updates when the hovered
// node actually changes (new breadcrumb). A click anywhere that isn't a protocol
// link toggles the tooltip off/on.
export default function TaxonomyTooltip({
  children,
}: {
  children: React.ReactNode;
}) {
  const [content, setContent] = useState<{
    path: string;
    desc: string | null;
    ticker: string | null;
    rebrand: string | null;
  } | null>(null);

  const tipRef = useRef<HTMLDivElement>(null);
  const enabledRef = useRef(true);
  const lastKey = useRef<string | null>(null);
  const raf = useRef<number | null>(null);
  const viewport = useRef({ w: 1920, h: 1080 });

  const hide = useCallback(() => {
    if (tipRef.current) tipRef.current.style.display = "none";
    lastKey.current = null;
  }, []);

  const place = useCallback((x: number, y: number) => {
    const el = tipRef.current;
    if (!el) return;
    const { w, h } = viewport.current;
    const nearRight = x > w - 340;
    const nearBottom = y > h - 140;
    el.style.left = `${x + (nearRight ? -14 : 14)}px`;
    el.style.top = `${y + (nearBottom ? -16 : 16)}px`;
    el.style.transform = `translate(${nearRight ? "-100%" : "0"}, ${nearBottom ? "-100%" : "0"})`;
  }, []);

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      if (!enabledRef.current) return;
      const x = e.clientX;
      const y = e.clientY;
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-path]");
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        if (!el) {
          hide();
          return;
        }
        if (tipRef.current) tipRef.current.style.display = "block";
        place(x, y); // imperative: no React render
        const key = el.dataset.path || "";
        if (key !== lastKey.current) {
          lastKey.current = key;
          setContent({
            path: key,
            desc: el.dataset.desc ?? null,
            ticker: el.dataset.ticker ?? null,
            rebrand: el.dataset.rebrand ?? null,
          });
        }
      });
    },
    [hide, place],
  );

  const clear = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    hide();
  }, [hide]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Let protocol links navigate without toggling.
      if ((e.target as HTMLElement).closest("a")) return;
      enabledRef.current = !enabledRef.current;
      if (!enabledRef.current) {
        if (raf.current) cancelAnimationFrame(raf.current);
        hide();
      }
    },
    [hide],
  );

  // Cache viewport size for tooltip placement; hide the tooltip while resizing.
  useEffect(() => {
    const readViewport = () => {
      viewport.current = { w: window.innerWidth, h: window.innerHeight };
    };
    readViewport();
    const onResize = () => {
      readViewport();
      hide();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [hide]);

  return (
    <div onMouseMove={handleMove} onMouseLeave={clear} onClick={handleClick}>
      {children}
      <div ref={tipRef} className={styles.tooltip} style={{ display: "none" }}>
        <div className={styles.tooltipPath}>
          {content?.path}
          {content?.ticker && (
            <span className={styles.tooltipTicker}>${content.ticker}</span>
          )}
        </div>
        {content?.rebrand && (
          <div className={styles.tooltipRebrand}>
            <span className={styles.tooltipRebrandLabel}>rebrand</span>
            {content.rebrand}
          </div>
        )}
        {content?.desc && <div className={styles.tooltipDesc}>{content.desc}</div>}
      </div>
    </div>
  );
}

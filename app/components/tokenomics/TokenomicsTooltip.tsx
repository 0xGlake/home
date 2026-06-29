"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./tokenomics.module.css";

// Single delegated tooltip for the whole map (mirrors the crypto taxonomy's
// approach). Concept chips carry `data-term` + `data-def`; on hover we walk up to
// the nearest element with a `data-term`. The tooltip follows the cursor by
// writing styles straight to its DOM node — React state only updates when the
// hovered concept changes. A click toggles the tooltip off/on.
export default function TokenomicsTooltip({
  children,
}: {
  children: React.ReactNode;
}) {
  const [content, setContent] = useState<{ term: string; def: string } | null>(
    null,
  );

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
    const nearBottom = y > h - 160;
    el.style.left = `${x + (nearRight ? -14 : 14)}px`;
    el.style.top = `${y + (nearBottom ? -16 : 16)}px`;
    el.style.transform = `translate(${nearRight ? "-100%" : "0"}, ${nearBottom ? "-100%" : "0"})`;
  }, []);

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      if (!enabledRef.current) return;
      const x = e.clientX;
      const y = e.clientY;
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-term]");
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        if (!el || !el.dataset.def) {
          hide();
          return;
        }
        if (tipRef.current) tipRef.current.style.display = "block";
        place(x, y);
        const key = el.dataset.term || "";
        if (key !== lastKey.current) {
          lastKey.current = key;
          setContent({ term: key, def: el.dataset.def });
        }
      });
    },
    [hide, place],
  );

  const clear = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    hide();
  }, [hide]);

  const handleClick = useCallback(() => {
    enabledRef.current = !enabledRef.current;
    if (!enabledRef.current) {
      if (raf.current) cancelAnimationFrame(raf.current);
      hide();
    }
  }, [hide]);

  // Cache viewport size for placement; hide while resizing.
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
        <div className={styles.tooltipTerm}>{content?.term}</div>
        {content?.def && <div className={styles.tooltipDef}>{content.def}</div>}
      </div>
    </div>
  );
}

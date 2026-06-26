"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Group } from "@/app/data/types";
import GroupBox from "./GroupBox";
import {
  createLayoutEngine,
  layoutSignature,
  type LayoutNode,
} from "./taxonomyLayout";
import styles from "./taxonomy.module.css";

// Horizontal padding of `.map` (7px each side) — subtracted to get the content
// width the top-level sections actually render into.
const MAP_PAD_X = 7;
const SSR_WIDTH = 1200; // first-paint guess; corrected on mount by the observer
const MOBILE_MAX = 640; // matches the single-column media query in the CSS

function layoutAll(groups: Group[], width: number): LayoutNode[] {
  const engine = createLayoutEngine(width <= MOBILE_MAX);
  return groups.map((g) => engine.layout(g, width, 0));
}

// Owns the only ResizeObserver in the tree. On width change it recomputes the
// masonry, but only commits to React state when the column structure actually
// changes (resizes within a breakpoint are a no-op), so re-renders are rare.
export default function TaxonomyMasonry({ groups }: { groups: Group[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<LayoutNode[]>(() =>
    layoutAll(groups, SSR_WIDTH - 2 * MAP_PAD_X),
  );
  const sigRef = useRef(nodes.map(layoutSignature).join(";"));

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;

    let frame = 0;
    const recompute = () => {
      frame = 0;
      const width = el.clientWidth - 2 * MAP_PAD_X;
      if (width <= 0) return;
      const next = layoutAll(groups, width);
      const sig = next.map(layoutSignature).join(";");
      if (sig !== sigRef.current) {
        sigRef.current = sig;
        setNodes(next);
      }
    };

    const observer = new ResizeObserver(() => {
      if (frame) return; // coalesce bursts into one rAF
      frame = requestAnimationFrame(recompute);
    });
    observer.observe(el);
    recompute(); // sync to the real width immediately

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [groups]);

  const rendered = useMemo(
    () => nodes.map((node, i) => <GroupBox key={i} node={node} />),
    [nodes],
  );

  return (
    <div ref={mapRef} className={styles.map}>
      {rendered}
    </div>
  );
}

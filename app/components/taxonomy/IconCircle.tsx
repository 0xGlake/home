"use client";

import { useState } from "react";
import type { Item } from "@/app/data/types";
import { normalizeItem, PATH_SEP } from "@/app/data/types";
import styles from "./taxonomy.module.css";

// Pull the handle out of an x.com / twitter.com link.
// Defensive: ignores non-X hosts, strips query strings and any trailing
// path segments (e.g. /status/...), returns null when there's nothing usable.
function xHandle(url?: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (host !== "x.com" && host !== "twitter.com") return null;
    const handle = parsed.pathname.split("/").filter(Boolean)[0];
    return handle || null;
  } catch {
    return null;
  }
}

export default function IconCircle({
  item,
  path = [],
}: {
  item: Item;
  path?: string[];
}) {
  const { name, url, img, description } = normalizeItem(item);
  const handle = xHandle(url);

  // Prefer a pinned image, then the X avatar via unavatar. `fallback=false`
  // makes genuine misses 404 so onError can degrade to an empty circle.
  const initialSrc = img
    ? img
    : handle
      ? `https://unavatar.io/x/${handle}?fallback=false`
      : null;

  const [src, setSrc] = useState<string | null>(initialSrc);

  // Full chain incl. the protocol itself, read by the tooltip on hover.
  const fullPath = [...path, name].join(PATH_SEP);

  // Name sits above the logo; the whole stack is the link target.
  const content = (
    <>
      <span className={styles.circleName}>{name}</span>
      <span className={styles.circle}>
        {src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name}
            width={20}
            height={20}
            loading="lazy"
            className={styles.circleImg}
            onError={() => setSrc(null)}
          />
        )}
      </span>
    </>
  );

  const shared = {
    className: styles.circleLink,
    "aria-label": name,
    "data-path": fullPath,
    ...(description ? { "data-desc": description } : {}),
  };

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" {...shared}>
        {content}
      </a>
    );
  }

  return <span {...shared}>{content}</span>;
}

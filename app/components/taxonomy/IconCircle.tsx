"use client";

import { useRef, useState } from "react";
import type { Item } from "@/app/data/types";
import { normalizeItem, PATH_SEP } from "@/app/data/types";
import avatarManifest from "@/app/data/avatarManifest.json";
import styles from "./taxonomy.module.css";

const manifest = avatarManifest as Record<string, string>;

function unavatar(handle: string): string {
  return `https://unavatar.io/x/${handle}?fallback=false`;
}

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
  const { name, url, img, description, coingeckoId, ticker } =
    normalizeItem(item);
  const handle = xHandle(url);
  const cached = handle ? manifest[handle.toLowerCase()] : undefined;

  // Source priority: pinned image → build-time cached avatar → unavatar at
  // runtime (covers handles not cached yet). onError walks this chain down,
  // ending at an empty circle.
  const initialSrc = img ?? cached ?? (handle ? unavatar(handle) : null);

  const [src, setSrc] = useState<string | null>(initialSrc);

  // Re-seed from props if this instance is reused for a different item (the
  // masonry reshuffles boxes on resize). Without this, the onError-tracked `src`
  // state could keep a previous protocol's avatar — see the key note in GroupBox.
  const lastInitial = useRef(initialSrc);
  if (lastInitial.current !== initialSrc) {
    lastInitial.current = initialSrc;
    setSrc(initialSrc);
  }

  const handleError = () => {
    if (cached && src === cached && handle) setSrc(unavatar(handle));
    else setSrc(null);
  };

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
            onError={handleError}
          />
        )}
      </span>
    </>
  );

  // Anything with a destination (X link and/or token page) opens the
  // cursor-anchored action popover handled by TaxonomyPopover, which reads these
  // data-* attributes off the nearest [data-protocol]. Items with no destination
  // are inert spans that still surface their breadcrumb on hover.
  const interactive = Boolean(url || coingeckoId);

  const shared = {
    "data-protocol": "",
    "aria-label": name,
    "data-name": name,
    "data-path": fullPath,
    ...(description ? { "data-desc": description } : {}),
    ...(ticker ? { "data-ticker": ticker } : {}),
    ...(url ? { "data-twitter": url } : {}),
    ...(coingeckoId ? { "data-coingecko": coingeckoId } : {}),
    // Drives the highlight toggle's background (see HighlightToggle / CSS).
    ...(coingeckoId ? { "data-token": "" } : {}),
  } as const;

  if (interactive) {
    return (
      <button
        type="button"
        className={`${styles.circleLink} ${styles.circleButton}`}
        {...shared}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={styles.circleLink} {...shared}>
      {content}
    </span>
  );
}

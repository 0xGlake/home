"use client";

import { useState } from "react";
import styles from "./taxonomy.module.css";

// One-time intro/caution overlay for the taxonomy map. Mirrors the canvas concept
// map's intro: a full-screen scrim with a dismissible card. Click the scrim, the
// button, or anywhere outside the card to enter.
export default function TaxonomyIntro() {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className={styles.introOverlay} onClick={() => setOpen(false)}>
      <div className={styles.introCard} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.introHeading}>Before you explore</h2>
        <p className={styles.introText}>
          The X / Twitter handles behind each logo are matched by hand and may be
          attributed incorrectly — please double-check before relying on them.
        </p>
        <p className={styles.introText}>
          Hover a protocol for its breadcrumb. Click anywhere to dismiss the
          tooltip, and click again to bring it back anytime.
        </p>
        <p className={styles.introText}>
          Spot something missing or wrong? Reach out on X at{" "}
          <a
            className={styles.introLink}
            href="https://x.com/0xGlake"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            @0xGlake
          </a>
          .
        </p>
        <button className={styles.introDismiss} onClick={() => setOpen(false)}>
          Enter
        </button>
      </div>
    </div>
  );
}

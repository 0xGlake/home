import type { Group } from "@/app/data/types";
import { PATH_SEP } from "@/app/data/types";
import IconCircle from "./IconCircle";
import styles from "./taxonomy.module.css";

// Masonry column width by nesting depth. CSS multi-column forces every column in
// a container to share one width, so we can't size siblings individually — but
// we *can* make shallow levels use wide columns (a few roomy columns, so big
// sub-trees get horizontal space to fan out) and deep levels use narrow ones
// (many tight columns). This minimises total height far better than a uniform
// width or a per-sibling content heuristic (which a single heavy child would
// drag every sibling into one tall column).
//
// Depth 0 uses a viewport-relative width so the column *count* stays ~3 at any
// viewport: as you widen (or zoom out) the columns expand to fill instead of the
// browser adding empty trailing columns, and the dominant box gets more room to
// spread (→ shorter) rather than leaving a right-side gap.
const TOP_COLUMN_WIDTH = "clamp(340px, 31vw, 920px)";
const COLUMN_WIDTH_BY_DEPTH = [195, 178];
const DEEP_COLUMN_WIDTH = 170;

function columnWidthFor(depth: number): string {
  if (depth === 0) return TOP_COLUMN_WIDTH;
  const px = COLUMN_WIDTH_BY_DEPTH[depth - 1] ?? DEEP_COLUMN_WIDTH;
  return `${px}px`;
}

// Recursive box. Renders the title + optional caption, then a row of labelled
// circles for `items` (the protocol name sits above each logo), then a masonry
// of nested boxes for `children`. The `isNew` flag is deliberately never read —
// see the brief. `path` is the chain of ancestor titles, surfaced in the hover
// tooltip via `data-path`.
export default function GroupBox({
  group,
  depth,
  path = [],
}: {
  group: Group;
  depth: number;
  path?: string[];
}) {
  const accent = group.accent ?? "sky";
  const selfPath = [...path, group.title];
  const hasChildren = !!group.children && group.children.length > 0;

  return (
    <section
      className={`${styles.box}${group.dashed ? ` ${styles.dashed}` : ""}`}
      data-accent={accent}
      data-depth={depth}
      data-path={selfPath.join(PATH_SEP)}
    >
      <header className={styles.header}>
        <h3 className={styles.title}>{group.title}</h3>
        {group.caption && <p className={styles.caption}>{group.caption}</p>}
      </header>

      {group.items && group.items.length > 0 && (
        <div className={styles.icons}>
          {group.items.map((item, i) => (
            <IconCircle key={i} item={item} path={selfPath} />
          ))}
        </div>
      )}

      {hasChildren && (
        <div
          className={styles.children}
          style={{ columnWidth: columnWidthFor(depth) }}
        >
          {group.children!.map((child, i) => (
            <GroupBox key={i} group={child} depth={depth + 1} path={selfPath} />
          ))}
        </div>
      )}
    </section>
  );
}

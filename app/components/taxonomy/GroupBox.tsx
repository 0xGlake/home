import { normalizeItem, PATH_SEP } from "@/app/data/types";
import type { LayoutNode } from "./taxonomyLayout";
import IconCircle from "./IconCircle";
import styles from "./taxonomy.module.css";

// Renders one box from a pre-computed LayoutNode: title + optional caption, a row
// of labelled circles for `items`, then the nested boxes already distributed into
// masonry columns by the layout engine. Each column is a plain flex stack — no CSS
// multi-column — so layout stays cheap. `path` is the ancestor-title breadcrumb
// surfaced in the hover tooltip via `data-path`.
export default function GroupBox({
  node,
  path = [],
}: {
  node: LayoutNode;
  path?: string[];
}) {
  const { group, depth, bands } = node;
  const accent = group.accent ?? "sky";
  const selfPath = [...path, group.title];

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
          {group.items.map((item) => {
            const { name } = normalizeItem(item);
            // Key by content, not index: the layout engine reshuffles boxes
            // between columns on resize, and an index key would let React reuse an
            // IconCircle (with its cached-image state) for a different protocol.
            return <IconCircle key={name} item={item} path={selfPath} />;
          })}
        </div>
      )}

      {bands.length > 0 && (
        <div className={styles.children}>
          {bands.map((band, bi) => (
            <div key={bi} className={styles.band}>
              {band.columns.map((col, ci) => (
                <div key={ci} className={styles.col} style={{ flexGrow: col.weight }}>
                  {col.nodes.map((child) => (
                    // Content key (sibling titles are unique) — see note above.
                    <GroupBox key={child.group.title} node={child} path={selfPath} />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

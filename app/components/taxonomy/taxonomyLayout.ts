import type { Group, Item } from "@/app/data/types";
import { normalizeItem } from "@/app/data/types";

// Deterministic masonry layout engine.
//
// CSS multi-column "balance" can't split a box (break-inside: avoid), so a single
// tall sub-tree forces its container's height and leaves the sibling columns
// half-empty — the dead space in the first pass. It is also one of the most
// expensive layout modes, and the old tree nested ~25 of them, which is what made
// resizing and the hover tooltip lag on narrow screens.
//
// Instead we estimate every box's rendered height from its content (calibrated
// against the real DOM — see the constants below) and lay each container out as a
// set of *variable-width* columns: column widths are driven by the content they
// hold and converge (a few damped iterations) so every column ends at roughly the
// same height. A heavy sub-tree (e.g. Aggregator) therefore gets a wide column,
// fans its own children into more sub-columns, and stays short instead of towering
// over its siblings. The render is plain flexbox (each column an independent flex
// stack sized by flex-grow), so layout is cheap and estimation errors only nudge
// the column widths — real content still flows correctly, nothing clips.

// --- Box geometry (must match taxonomy.module.css) ------------------------------
const BORDER = 1;
const PAD_X = 7;
const PAD_Y = 5;
const SECTION_GAP = 4; // gap between header / icons / children inside a box

// Header text metrics (12px/15 bold title, 0.82em italic caption).
const TITLE_LINE = 15;
const TITLE_CHAR_W = 6.4;
const HEADER_GAP = 1; // title → caption
const CAPTION_LINE = 12;
const CAPTION_CHAR_W = 4.9;

// Icon grid metrics (fixed 56px cells, 9px two-line-clamped names).
const ICON_CELL = 56;
const ICON_COL_GAP = 6;
const ICON_ROW_GAP = 5;
const ICON_STEP = ICON_CELL + ICON_COL_GAP;
const NAME_WIDTH = 52;
const NAME_CHAR_W = 5.0;
const ICON_CIRCLE = 20;
const ICON_NAME_GAP = 1;
const NAME_LINE = 9.5;

// Nested-children masonry gaps (exported so the CSS/JSX stay in sync).
export const COL_GAP = 8; // horizontal gap between masonry columns
export const ROW_GAP = 5; // vertical gap between stacked boxes in a column

// Max columns a container may use, by the *parent* box depth. The actual count is
// chosen per container by minimising height (see distribute), so this is only an
// upper bound that keeps deep/narrow levels from over-splitting.
const MAXCOLS_BY_DEPTH = [4, 4, 3];
const MAXCOLS_DEEP = 2;
const MIN_COL_WIDTH = 96; // floor so width-balancing can't starve a column

// Width-balancing loop: iterate column widths toward content-proportional, damped
// so a single dominant box doesn't oscillate across an internal column threshold.
const BALANCE_ITERS = 10;
const PULL = 0.55;

// How much taller than the shortest packing we'll accept in exchange for more,
// narrower columns (boxes sized to their content rather than stretched wide).
const HEIGHT_TOLERANCE = 0.06;

// Column-height spread (max-min, as a fraction of max) above which a container is
// "unbalanced" enough to try peeling its tallest box into a full-width band. A
// peeled (banded) layout fills the dead space beside the tall box, so we accept it
// even when it's slightly taller than the unbalanced base — up to BAND_SLACK over
// the base's tallest column.
const BAND_IMBALANCE = 0.22;
const BAND_SLACK = 0.12;
const BAND_MAX_DEPTH = 1; // only the two shallowest container levels may band

function maxCols(depth: number): number {
  return MAXCOLS_BY_DEPTH[depth] ?? MAXCOLS_DEEP;
}

// Greedy word-wrap: how many lines `text` takes at `width` px for a given avg
// char width. Accounts for word breaks (the dominant cause of 2-line names).
function lineCount(text: string, width: number, charW: number): number {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 1;
  let lines = 1;
  let cur = 0;
  for (const word of words) {
    const w = word.length * charW;
    if (cur === 0) cur = w;
    else if (cur + charW + w <= width) cur += charW + w;
    else {
      lines++;
      cur = w;
    }
    if (w > width) {
      lines += Math.floor(w / width);
      cur = w % width;
    }
  }
  return lines;
}

function headerHeight(group: Group, inner: number): number {
  let h = lineCount(group.title, inner, TITLE_CHAR_W) * TITLE_LINE;
  if (group.caption) {
    h += HEADER_GAP + lineCount(group.caption, inner, CAPTION_CHAR_W) * CAPTION_LINE;
  }
  return h;
}

function iconsHeight(items: Item[], inner: number): number {
  const perRow = Math.max(1, Math.floor((inner + ICON_COL_GAP) / ICON_STEP));
  const names = items.map((it) => normalizeItem(it).name);
  let total = 0;
  for (let i = 0; i < names.length; i += perRow) {
    const row = names.slice(i, i + perRow);
    const nameLines = Math.max(
      1,
      ...row.map((n) => lineCount(n, NAME_WIDTH, NAME_CHAR_W)),
    );
    const rowH = ICON_CIRCLE + ICON_NAME_GAP + nameLines * NAME_LINE;
    total += (i > 0 ? ICON_ROW_GAP : 0) + rowH;
  }
  return total;
}

// One masonry column: the boxes assigned to it, its flex-grow weight (∝ width) and
// estimated stacked height.
export interface Column {
  nodes: LayoutNode[];
  weight: number;
  height: number;
}

// A full-width horizontal band of masonry columns. A container's children are a
// vertical stack of bands — usually just one, but a box too tall to balance is
// peeled into its own full-width band (where it fans out and stays short) with the
// lighter siblings packed in masonry bands around it.
export interface Band {
  columns: Column[];
  height: number;
}

// A box plus its children laid out as stacked bands.
export interface LayoutNode {
  group: Group;
  depth: number;
  height: number; // estimated rendered height (px)
  bands: Band[]; // empty when the box has no children
}

// Engine instance: memoizes layout by (group, rounded width) so the inner
// balancing loop — which lays each child out at several candidate widths — stays
// cheap even for the deep tree. One instance per full layout pass. `singleColumn`
// forces every container to one column (used on phones, where the layout stacks
// vertically anyway — this keeps boxes in source order rather than column-major).
export function createLayoutEngine(singleColumn = false) {
  const memo = new WeakMap<Group, Map<number, LayoutNode>>();
  const bucket = (w: number) => Math.max(1, Math.round(w / 6) * 6);

  function layout(group: Group, width: number, depth: number): LayoutNode {
    const b = bucket(width);
    let byWidth = memo.get(group);
    if (!byWidth) memo.set(group, (byWidth = new Map()));
    const hit = byWidth.get(b);
    if (hit) return hit;
    const node = compute(group, b, depth);
    byWidth.set(b, node);
    return node;
  }

  function compute(group: Group, width: number, depth: number): LayoutNode {
    const inner = width - 2 * PAD_X - 2 * BORDER;
    let height = 2 * PAD_Y + 2 * BORDER + headerHeight(group, inner);

    if (group.items && group.items.length > 0) {
      height += SECTION_GAP + iconsHeight(group.items, inner);
    }

    let bands: Band[] = [];
    if (group.children && group.children.length > 0) {
      bands = layoutChildren(group.children, inner, depth);
      const stacked = bands.reduce((s, b, i) => s + (i ? ROW_GAP : 0) + b.height, 0);
      height += SECTION_GAP + stacked;
    }

    return { group, depth, height, bands };
  }

  // Stacked height of a set of children laid out at a given column width.
  function stackHeight(items: Group[], width: number, depth: number): number {
    let h = 0;
    for (let i = 0; i < items.length; i++) {
      h += (i ? ROW_GAP : 0) + layout(items[i], width, depth + 1).height;
    }
    return h;
  }

  // Equal-width greedy assignment of children into k columns (each child joins the
  // currently-shortest column). Returns the child groups per column.
  function assignEqual(children: Group[], k: number, depth: number, avail: number) {
    const w = avail / k;
    const cols = Array.from({ length: k }, () => ({ items: [] as Group[], h: 0 }));
    for (const child of children) {
      const h = layout(child, w, depth + 1).height;
      let best = 0;
      for (let j = 1; j < k; j++) if (cols[j].h < cols[best].h) best = j;
      const c = cols[best];
      c.h += (c.items.length ? ROW_GAP : 0) + h;
      c.items.push(child);
    }
    return cols;
  }

  // Lay children out in exactly `k` columns: equal-width greedy assignment, then a
  // stable width-balancing pass (taller column → wider, fixed assignment so there
  // is no reassignment thrash across internal column thresholds).
  function layoutForK(
    children: Group[],
    inner: number,
    depth: number,
    k: number,
  ): { columns: Column[]; height: number } {
    const avail = inner - (k - 1) * COL_GAP;
    const groups = assignEqual(children, k, depth, avail).map((c) => c.items);

    let widths = new Array<number>(k).fill(avail / k);
    if (k > 1) {
      for (let iter = 0; iter < BALANCE_ITERS; iter++) {
        const heights = groups.map((g, j) =>
          Math.max(stackHeight(g, widths[j], depth), 1),
        );
        const sum = heights.reduce((a, b) => a + b, 0);
        let next = widths.map(
          (w, j) => w * (1 - PULL) + ((avail * heights[j]) / sum) * PULL,
        );
        next = next.map((w) => Math.max(w, MIN_COL_WIDTH));
        const norm = next.reduce((a, b) => a + b, 0);
        widths = next.map((w) => (w * avail) / norm);
      }
    }

    const columns = groups.map((g, j) => {
      const w = k === 1 ? inner : widths[j];
      return {
        nodes: g.map((c) => layout(c, w, depth + 1)),
        weight: k === 1 ? 1 : widths[j],
        height: stackHeight(g, w, depth),
      };
    });
    return { columns, height: Math.max(0, ...columns.map((c) => c.height)) };
  }

  // Pack children into one masonry band: choose the column count and widths. A
  // dominant sub-tree lands in its own wide column and fans out instead of
  // towering. We don't simply minimise height — that favours few very wide columns,
  // leaving small leaf boxes stretched and sparse. Instead we take the *largest* K
  // whose packed height stays within tolerance of the shortest, so boxes are sized
  // to their content while height stays near-optimal.
  function distribute(children: Group[], inner: number, depth: number): Band {
    const maxK = singleColumn ? 1 : Math.min(children.length, maxCols(depth));

    const results = [layoutForK(children, inner, depth, 1)];
    let minH = results[0].height;
    for (let k = 2; k <= maxK; k++) {
      if ((inner - (k - 1) * COL_GAP) / k < MIN_COL_WIDTH) break;
      const r = layoutForK(children, inner, depth, k);
      results.push(r);
      if (r.height < minH) minH = r.height;
    }

    const limit = minH * (1 + HEIGHT_TOLERANCE);
    let chosen = results[0];
    for (const r of results) if (r.height <= limit) chosen = r;
    return chosen;
  }

  // A single box occupying a full-width band (it fans its own children internally).
  function fullWidthBand(group: Group, inner: number, depth: number): Band {
    const node = layout(group, inner, depth + 1);
    return { columns: [{ nodes: [node], weight: 1, height: node.height }], height: node.height };
  }

  // Lay a container's children out as a vertical stack of bands. Usually a single
  // masonry band — but if one box is too tall for the others to balance against
  // (leaving dead space beside it), peel it into its own full-width band where it
  // fans out and shrinks, and masonry the lighter siblings in the runs around it
  // (source order preserved).
  function layoutChildren(children: Group[], inner: number, depth: number): Band[] {
    const base = distribute(children, inner, depth);

    // Banding is only applied near the top of the tree, where a dominant sub-tree
    // genuinely towers over its siblings. Deeper boxes are small and uniform, and
    // banding them just adds width-dependent noise to the height estimates that the
    // shallow column-count choices depend on.
    if (depth > BAND_MAX_DEPTH || children.length < 3 || base.columns.length < 2) {
      return [base];
    }

    const heights = base.columns.map((c) => c.height);
    const maxH = Math.max(...heights);
    const minH = Math.min(...heights);
    if (maxH - minH < BAND_IMBALANCE * maxH) return [base]; // already balanced

    // The bottleneck is the tallest single box; only worth peeling if it can fan.
    let dom: LayoutNode | null = null;
    for (const c of base.columns) {
      for (const n of c.nodes) if (!dom || n.height > dom.height) dom = n;
    }
    if (!dom || dom.bands.length === 0) return [base];

    const promoted = new Set<Group>([dom.group]);
    const bands: Band[] = [];
    let run: Group[] = [];
    const flush = () => {
      if (run.length) bands.push(distribute(run, inner, depth));
      run = [];
    };
    for (const child of children) {
      if (promoted.has(child)) {
        flush();
        bands.push(fullWidthBand(child, inner, depth));
      } else run.push(child);
    }
    flush();

    const bandedH = bands.reduce((s, b, i) => s + (i ? ROW_GAP : 0) + b.height, 0);
    return bandedH <= base.height * (1 + BAND_SLACK) ? bands : [base];
  }

  return { layout };
}

// Compact signature of the band/column *structure* (counts + nesting), so the
// client can skip re-rendering when a resize doesn't change any layout.
export function layoutSignature(node: LayoutNode): string {
  if (node.bands.length === 0) return "";
  return (
    "{" +
    node.bands
      .map(
        (b) =>
          b.columns.length +
          "[" +
          b.columns.map((c) => c.nodes.map(layoutSignature).join(",")).join("|") +
          "]",
      )
      .join(";") +
    "}"
  );
}

import { taxonomy } from "@/app/data/taxonomyData";
import {
  normalizeItem,
  type Accent,
  type Group,
  type NormalizedItem,
} from "@/app/data/types";
import avatarManifest from "@/app/data/avatarManifest.json";

// Turns the taxonomy tree into the data the watchlist panel needs:
//  • a real nested tree (`tokenTree`) the Grouped view renders recursively,
//  • a flat, deduped list (`flatTokens`) for the sortable "All" view + favourites,
//  • every group id (`allGroupIds`) for the expand-all / collapse-all toggle,
//  • the unique CoinGecko ids the price route asks about.
//
// Only items carrying a `coingeckoId` (fungible token) or `coingeckoNftId` (NFT
// collection floor price) are kept; group nodes whose whole subtree holds no such
// priced item are pruned.

const SEP = " → ";
const COIN_URL = "https://www.coingecko.com/en/coins/";
const NFT_URL = "https://www.coingecko.com/en/nft/";
const manifest = avatarManifest as Record<string, string>;

export interface TokenRow {
  name: string;
  ticker: string; // uppercased; "—" when the item had none
  symbol: string; // trading-pair label, e.g. "LINKUSD" (falls back to name)
  priceKey: string; // key into the /api/prices map (coin id, or NFT id)
  url: string; // CoinGecko page to open on click
  isNft: boolean;
  path: string; // full breadcrumb, e.g. "Exchanges (Volume) → Derivatives → Options"
  accent: Accent;
  logo: string | null; // pinned img → cached avatar → unavatar, else null
}

export interface TokenTreeNode {
  id: string; // stable id (the full path) used for collapse state
  title: string;
  path: string;
  accent: Accent;
  children: TokenTreeNode[];
  tokens: TokenRow[]; // direct leaf tokens, sorted later by 24h change
  count: number; // total tokens in the whole subtree (badge)
}

function unavatar(handle: string): string {
  return `https://unavatar.io/x/${handle}?fallback=false`;
}

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

// Same source priority as IconCircle: pinned image → build-time cached avatar →
// unavatar at runtime. The row hides the <img> on error, leaving an empty disc.
function logoFor(item: NormalizedItem): string | null {
  if (item.img) return item.img;
  const handle = xHandle(item.url);
  if (!handle) return null;
  return manifest[handle.toLowerCase()] ?? unavatar(handle);
}

function build(
  g: Group,
  trail: string[],
  parentAccent: Accent,
): TokenTreeNode | null {
  const path = [...trail, g.title];
  const pathStr = path.join(SEP);
  const accent = g.accent ?? parentAccent;

  const tokens: TokenRow[] = [];
  for (const raw of g.items ?? []) {
    const item = normalizeItem(raw);
    const isNft = !item.coingeckoId && Boolean(item.coingeckoNftId);
    const priceKey = item.coingeckoId ?? item.coingeckoNftId;
    if (!priceKey) continue;
    const ticker = item.ticker ? item.ticker.toUpperCase() : "—";
    tokens.push({
      name: item.name,
      ticker,
      // NFT collections have no USD trading pair → show the protocol name.
      symbol: isNft || ticker === "—" ? item.name : `${ticker}USD`,
      priceKey,
      url: (isNft ? NFT_URL : COIN_URL) + priceKey,
      isNft,
      path: pathStr,
      accent,
      logo: logoFor(item),
    });
  }

  const children = (g.children ?? [])
    .map((c) => build(c, path, accent))
    .filter((n): n is TokenTreeNode => n !== null);

  const count =
    tokens.length + children.reduce((sum, c) => sum + c.count, 0);
  if (count === 0) return null;

  return { id: pathStr, title: g.title, path: pathStr, accent, children, tokens, count };
}

export const tokenTree: TokenTreeNode[] = taxonomy
  .map((g) => build(g, [], "sky"))
  .filter((n): n is TokenTreeNode => n !== null);

// Every group id in the tree, for the expand-all / collapse-all toggle.
export const allGroupIds: string[] = (() => {
  const ids: string[] = [];
  const walk = (nodes: TokenTreeNode[]) => {
    for (const n of nodes) {
      ids.push(n.id);
      walk(n.children);
    }
  };
  walk(tokenTree);
  return ids;
})();

function collect(node: TokenTreeNode, out: TokenRow[]): void {
  out.push(...node.tokens);
  for (const c of node.children) collect(c, out);
}

// Flat, deduped list (one row per asset) for the "All" view.
export const flatTokens: TokenRow[] = (() => {
  const all: TokenRow[] = [];
  for (const n of tokenTree) collect(n, all);
  const seen = new Set<string>();
  const out: TokenRow[] = [];
  for (const row of all) {
    if (seen.has(row.priceKey)) continue;
    seen.add(row.priceKey);
    out.push(row);
  }
  return out;
})();

// Split for the price route: fungible coins hit simple/price, NFTs hit /nfts/{id}.
export const coingeckoIds: string[] = flatTokens
  .filter((t) => !t.isNft)
  .map((t) => t.priceKey);

export const coingeckoNftIds: string[] = flatTokens
  .filter((t) => t.isNft)
  .map((t) => t.priceKey);

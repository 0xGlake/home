// Data contract for the taxonomy map.

export type Accent =
  | "sky"
  | "blue"
  | "teal"
  | "purple"
  | "pink"
  | "amber"
  | "green"
  | "coral";

export type Item =
  | string
  | {
      name: string;
      url?: string;
      img?: string;
      description?: string; // optional blurb shown in the hover tooltip
      coingeckoId?: string; // CoinGecko coin id → /en/coins/<id>
      coingeckoNftId?: string; // CoinGecko NFT id → /en/nft/<id> (floor price)
      ticker?: string; // token symbol, e.g. "LINK"
      rebrandFrom?: string[]; // former names, oldest → newest (rebrand trail)
    };

export interface Group {
  title: string;
  caption?: string; // small italic note under the title
  accent?: Accent; // title colour key; default "sky"
  dashed?: boolean; // dashed border style
  items?: Item[]; // leaf protocols → circles
  children?: Group[]; // nested boxes
}

export interface NormalizedItem {
  name: string;
  url?: string;
  img?: string;
  description?: string;
  coingeckoId?: string;
  coingeckoNftId?: string;
  ticker?: string;
  rebrandFrom?: string[];
}

// Turns a bare string item into the object form.
export function normalizeItem(item: Item): NormalizedItem {
  return typeof item === "string" ? { name: item } : item;
}

// Separator for the breadcrumb path shown in the hover tooltip.
export const PATH_SEP = " → ";

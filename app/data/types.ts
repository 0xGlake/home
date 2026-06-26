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
      isNew?: boolean;
      img?: string;
      description?: string; // optional blurb shown in the hover tooltip
    };

export interface Group {
  title: string;
  caption?: string; // small italic note under the title
  accent?: Accent; // title colour key; default "sky"
  dashed?: boolean; // dashed border style
  isNew?: boolean; // private diff marker — never rendered
  items?: Item[]; // leaf protocols → circles
  children?: Group[]; // nested boxes
}

export interface NormalizedItem {
  name: string;
  url?: string;
  isNew?: boolean;
  img?: string;
  description?: string;
}

// Turns a bare string item into the object form.
export function normalizeItem(item: Item): NormalizedItem {
  return typeof item === "string" ? { name: item } : item;
}

// Separator for the breadcrumb path shown in the hover tooltip.
export const PATH_SEP = " → ";

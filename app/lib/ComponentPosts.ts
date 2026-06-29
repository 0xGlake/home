// Blog posts backed by a bespoke React component (not markdown or canvas).
// Registered here so they appear in the /blog list and resolve through the
// shared [slug] route, just like the auto-discovered post types.

export interface ComponentPostMeta {
  slug: string;
  title: string;
  date: string;
  category: string;
}

export const componentPosts: ComponentPostMeta[] = [
  {
    slug: "crypto-taxonomy",
    title: "Crypto Taxonomy Map",
    date: "2026-06-26",
    category: "Crypto",
  },
  {
    slug: "tokenomics-taxonomy",
    title: "Tokenomics Taxonomy",
    date: "2026-06-29",
    category: "Crypto",
  },
];

export function getComponentPost(slug: string): ComponentPostMeta | undefined {
  return componentPosts.find((post) => post.slug === slug);
}

export interface ReadingListItemStruct {
  name: string;
  url: string;
  description?: string;
  category?: string;
  favouritePosts?: string[];
}

export const readingList: ReadingListItemStruct[] = [
  {
    name: "Back the Bunny",
    url: "https://backthebunny.substack.com/",
    description:
      "One of the most articulate thinkers in crypto imo. This helped me understand the value proposition of the space in more detail and learn about the basics of the FED amongst other things.",
    category: "Crypto",
    favouritePosts: [
      "https://backthebunny.substack.com/p/elon-yarvin-and-verbal-vs-embodied",
      "https://backthebunny.substack.com/p/crypto-stocks-hammers-gold-and-intrinsic",
      "https://backthebunny.substack.com/p/ai-amplifies-you-and-dilutes-you",
    ],
  },
  {
    name: "Good Alexander",
    url: "https://goodalexander.com/",
    description: "Crypto hopeium",
    category: "Crypto",
    favouritePosts: [
      "https://goodalexander.com/posts/investment-philosophy/",
      "https://goodalexander.com/posts/murad_meta_ai_cult/",
    ],
  },
  {
    name: "Charlotte Fang",
    url: "https://goldenlight.mirror.xyz/",
    description: "Milady",
    category: "Crypto",
    favouritePosts: [
      "https://goldenlight.mirror.xyz/qrXKqoUvzXEtcbM_hvezCxmJaJn4t6CjAh2kocDzxNA",
      "https://goldenlight.mirror.xyz/AKywgieGgURdeM_NyewNhwXtxcS6pPscQPvT4JmCdF0",
    ],
  },
  {
    name: "Adjacent Research",
    url: "https://www.adjacentresearch.xyz/list.html",
    description:
      "Good for keeping up with event markets and defi derrivatives. Also has lots of good collections and news feeds for keeping up with crypto.",
    category: "Crypto",
    favouritePosts: [
      "https://adjacentresearch.substack.com/p/ramblings-on-event-markets",
    ],
  },
  {
    name: "Crypto Hayes",
    url: "https://cryptohayes.substack.com/",
    description: "Crypto main character. Understands markets.",
    category: "Crypto",
    favouritePosts: [
      "https://cryptohayes.substack.com/p/chief-story-officer",
      "https://cryptohayes.substack.com/p/dust-on-crust-part-deux",
    ],
  },
  {
    name: "Naval",
    url: "https://nav.al/archive",
    description:
      "Naval. Self explanatory, one of the most prolific thinkers in the space of startups, sparked my initial interest in startups and defi in 2020.",
    category: "Tech",
  },
  {
    name: "Thinking Directions (Jean Moroney)",
    url: "https://www.thinkingdirections.com/",
    description:
      "Amazing insights into motivation, productivity, and happiness. Jean also has a lot of podcast appearances that are gold mines.",
    category: "Psychology",
    favouritePosts: [],
  },
  {
    name: "Delusion Damage",
    url: "https://web.archive.org/web/20120104224226/http://delusiondamage.com/article-index/",
    description:
      "Suggestion in passing by Naval. The first collection of articles are really good, then he goes into anarchist and pick-up artist territory. I like the blog more to see what seeds were planted early on that then shaped internet culture (I'd say this blog was seminal for manosphere content today)",
    category: "Misc",
    favouritePosts: [],
  },
  {
    name: "Richard Hanania",
    url: "https://substack.com/@richardhanania",
    description:
      "Good commentary on politics, one of the few good posters on twitter and also very interesting political commentary",
    category: "Misc / Politics",
    favouritePosts: [],
  },
  {
    name: "Alex Kehayias",
    url: "https://notes.alexkehayias.com/",
    description:
      "Its someones personal obsidian, when I first found this I got lost for hours its really addicting. Covers a wide range of topics.",
    category: "Tech",
    favouritePosts: [
      "https://notes.alexkehayias.com/ai-multiplies-the-value-of-expertise/",
      "https://notes.alexkehayias.com/stock-and-flow/",
      "https://notes.alexkehayias.com/compounding-is-unintuitive-because-the-initial-curve-feels-flat/",
    ],
  },
  {
    name: "Paul Graham",
    url: "http://www.paulgraham.com/articles.html",
    description:
      "Paul Graham, pretty self explanatory as the tech bro bible along with Peter Thiel's zero-to-one.",
    category: "Tech",
    favouritePosts: [
      "https://www.paulgraham.com/think.html",
      "https://www.paulgraham.com/superlinear.html",
      "https://www.paulgraham.com/cities.html",
    ],
  },
  {
    name: "Nearcyan",
    url: "https://near.blog/",
    description: 'Their "Links" tab was this pages inspiration.',
    category: "Tech",
    favouritePosts: ["https://near.blog/how-to-twitter-successfully/"],
  },
  {
    name: "Ribbonfarm",
    url: "https://www.ribbonfarm.com/",
    description:
      "Interesting ideas around narratives and human interactions in the workplace",
    category: "Career",
    favouritePosts: [
      "https://www.ribbonfarm.com/2009/10/07/the-gervais-principle-or-the-office-according-to-the-office/",
      "https://studio.ribbonfarm.com/p/superhistory-not-superintelligence",
    ],
  },
  {
    name: "Mochary Method",
    url: "https://docs.google.com/document/d/18FiJbYn53fTtPmphfdCKT2TMWH-8Y2L-MLqDk-MFV4s/edit",
    description: "Succinct posts related to career and productivity.",
    category: "Career",
    favouritePosts: [
      "https://docs.google.com/document/d/11UVWJox31Ani8Cq6Ymhm6DiVUiv5vPkOQd8ZdGpYmbs/edit#",
    ],
  },
  {
    name: "Charles Tew",
    url: "https://www.charlestew.com/",
    description:
      "Objectivist philosopher who used to make videos a but re-surfaced with a blog (I wish he'd write more)",
    category: "Philosophy",
    favouritePosts: ["https://www.youtube.com/@CharlesTew"],
  },
  {
    name: "Plaintext Capital",
    url: "https://www.plaintextcapital.com/blog/",
    category: "Venture",
  },
  {
    name: "Sequoia Capital",
    url: "https://www.sequoiacap.com/",
    category: "Venture",
  },
  {
    name: "Reverie Capital",
    url: "https://www.reverie.ooo/writing",
    category: "Venture",
    favouritePosts: ["https://www.reverie.ooo/post/why-the-winners-won"],
  },
  {
    name: "Sasha Chapin",
    url: "https://sashachapin.substack.com/",
    category: "Personal Development",
    favouritePosts: [
      "https://sashachapin.substack.com/p/connecting-with-people-more-easily",
    ],
  },
  {
    name: "Mindmine (isabelunraveled)",
    url: "https://read.mindmine.xyz/",
    category: "Personal Development",
    favouritePosts: [
      "https://read.mindmine.xyz/p/ideas",
      "https://read.mindmine.xyz/p/on-being-ready",
    ],
  },
  {
    name: "Cyberpatterns (iamjasonlevin)",
    url: "https://www.cyberpatterns.xyz/",
    description:
      "Interesting views on marketing and the practical side for memetics.",
    category: "Marketing",
    favouritePosts: ["https://www.cyberpatterns.xyz/p/skydiving"],
  },
  {
    name: "Dan Luu",
    url: "https://danluu.com/",
    category: "Tech",
    favouritePosts: ["https://danluu.com/p95-skill/"],
  },
  {
    name: "Kartikay",
    url: "https://kartikay.bearblog.dev/",
    description:
      "Writes digestible pieces about general tech and personal development.",
    category: "Tech",
  },
  {
    name: "Sourcegraph",
    url: "https://about.sourcegraph.com/blog",
    description: "General tech articles, found through Primeagen.",
    category: "Tech",
  },
  {
    name: "Yacine",
    url: "https://yacine.ca/",
    description:
      "Was fun to follow his journey building DingBoard (looks like hes taken it down now) update: hes at twitter now",
    category: "Tech",
  },
  {
    name: "Nat Friedman",
    url: "https://nat.org/",
    description:
      "One of the best landing pages, incredibly succinct life mission.",
    category: "Tech",
  },
  {
    name: "Crypto Narratives (thedefivillain)",
    url: "https://substack.com/@cryptonarratives",
    description: "Crypto news",
    category: "Crypto",
    favouritePosts: [
      "https://cryptonarratives.substack.com/p/compilation-of-the-best-gcr-nuggets",
    ],
  },
  {
    name: "Unenumerated (nickszabo)",
    url: "https://unenumerated.blogspot.com/",
    description: "Nick Szabo (Satoshi.. probably)",
    category: "Economics",
  },
  {
    name: "Jim Brown (jim3c5)",
    url: "https://substack.com/@jim3c5",
    description:
      "He has a lecture series on money I'd like to get into eventually.",
    category: "Economics",
  },
  {
    name: "Critical Fallibilism (Elliot Temple)",
    url: "https://criticalfallibilism.com/",
    category: "Philosophy",
  },
  {
    name: "Lindy (PaulSkallas)",
    url: "https://lindynewsletter.beehiiv.com/",
    category: "Tech",
  },
];

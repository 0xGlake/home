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
    description: "One of the most articulate thinkers in crypto. This helped me understand the value proposition of the space more deeply and learn about the basics of the FED amongst other things.",
    category: "Crypto",
    favouritePosts: [
      "https://backthebunny.substack.com/p/elon-yarvin-and-verbal-vs-embodied",
      "https://backthebunny.substack.com/p/crypto-stocks-hammers-gold-and-intrinsic",
      "https://backthebunny.substack.com/p/ai-amplifies-you-and-dilutes-you"
    ]
  },
  {
    name: "Good Alexander",
    url: "https://goodalexander.com/",
    description: "Crypto hopeium",
    category: "Crypto",
    favouritePosts: ["https://goodalexander.com/posts/investment-philosophy/"]
  },
  {
    name: "Charlotte Fang",
    url: "https://goldenlight.mirror.xyz/",
    description: "Dont agree with everything Charlotte Fang does/says but I think they have one of the highest raw intellects in this space and I think they're leading one of the only art movements in the crypto space through remilia. Also has one of if not the best understandinf of deep internet culture.",
    category: "Crypto",
    favouritePosts: [
      "https://goldenlight.mirror.xyz/qrXKqoUvzXEtcbM_hvezCxmJaJn4t6CjAh2kocDzxNA",
      "https://goldenlight.mirror.xyz/AKywgieGgURdeM_NyewNhwXtxcS6pPscQPvT4JmCdF0"
    ]
  },
  {
    name: "Adjacent Research",
    url: "https://www.adjacentresearch.xyz/list.html",
    description: "Good for keeping up with event markets and defi derrivatives. Also has lots of good collections and news feeds for keeping up with crypto.",
    category: "Crypto",
    favouritePosts: ["https://adjacentresearch.substack.com/p/ramblings-on-event-markets"]
  },
  {
    name: "Crypto Hayes",
    url: "https://cryptohayes.substack.com/",
    description: "Crypto main character. Understands markets deeply.",
    category: "Crypto",
    favouritePosts: [
      "https://cryptohayes.substack.com/p/chief-story-officer",
      "https://cryptohayes.substack.com/p/dust-on-crust-part-deux"
    ]
  },
  {
    name: "Naval",
    url: "https://nav.al/archive",
    description: "Naval. Self explanatory, one of the most prolific thinkers in the space of startups, sparked my interest in startups way back.",
    category: "Tech"
  },
  {
    name: "Alex Kehayias",
    url: "https://notes.alexkehayias.com/",
    description: "Its someones personal obsidian, when I first found this I got lost for hours its really addicting.",
    category: "Tech",
    favouritePosts: [
      "https://notes.alexkehayias.com/ai-multiplies-the-value-of-expertise/",
      "https://notes.alexkehayias.com/stock-and-flow/",
      "https://notes.alexkehayias.com/compounding-is-unintuitive-because-the-initial-curve-feels-flat/"
    ]
  },
  {
    name: "Paul Graham",
    url: "http://www.paulgraham.com/articles.html",
    description: "Its Paul Graham, pretty self explanatory as the tech bro bible along with Peter Thiel's zero-to-one.",
    category: "Tech",
    favouritePosts: [
      "https://www.paulgraham.com/think.html",
      "https://www.paulgraham.com/superlinear.html",
      "https://www.paulgraham.com/cities.html"
    ]
  },
  {
    name: "Nearcyan",
    url: "https://near.blog/",
    description: "Their \"Links\" tab is what this page aspires to be.",
    category: "Tech",
    favouritePosts: ["https://near.blog/how-to-twitter-successfully/"]
  },
  {
    name: "Ribbonfarm",
    url: "https://www.ribbonfarm.com/",
    description: "Interesting ideas around narratives and human interactions in the workplace",
    category: "Career",
    favouritePosts: ["https://www.ribbonfarm.com/2009/10/07/the-gervais-principle-or-the-office-according-to-the-office/"]
  },
  {
    name: "Mochary Method",
    url: "https://docs.google.com/document/d/18FiJbYn53fTtPmphfdCKT2TMWH-8Y2L-MLqDk-MFV4s/edit",
    description: "Succinct posts that helped me understand career related topics and productivity.",
    category: "Career",
    favouritePosts: ["https://docs.google.com/document/d/11UVWJox31Ani8Cq6Ymhm6DiVUiv5vPkOQd8ZdGpYmbs/edit#"]
  },
  {
    name: "Charles Tew",
    url: "https://www.charlestew.com/",
    description: "Objectivist philosopher who used to make videos a long time ago but re-surfaced with a blog (I wish he'd write more)",
    category: "Philosophy",
    favouritePosts: ["https://www.youtube.com/@CharlesTew"]
  },
  {
    name: "Plaintext Capital",
    url: "https://www.plaintextcapital.com/blog/",
    category: "Venture"
  },
  {
    name: "Sequoia Capital",
    url: "https://www.sequoiacap.com/",
    category: "Venture"
  },
  {
    name: "Reverie Capital",
    url: "https://www.reverie.ooo/writing",
    category: "Venture",
    favouritePosts: ["https://www.reverie.ooo/post/why-the-winners-won"]
  },
  {
    name: "Sasha Chapin",
    url: "https://sashachapin.substack.com/",
    category: "Personal Development",
    favouritePosts: ["https://sashachapin.substack.com/p/connecting-with-people-more-easily"]
  },
  {
    name: "Mindmine (isabelunraveled)",
    url: "https://read.mindmine.xyz/",
    description: "One of my favourite twitter accounts at the moment.",
    category: "Personal Development",
    favouritePosts: [
      "https://read.mindmine.xyz/p/ideas",
      "https://read.mindmine.xyz/p/on-being-ready"
    ]
  },
  {
    name: "Cyberpatterns (iamjasonlevin)",
    url: "https://www.cyberpatterns.xyz/",
    description: "Interesting views on marketing and the practical side for memetics.",
    category: "Marketing",
    favouritePosts: ["https://www.cyberpatterns.xyz/p/skydiving"]
  },
  {
    name: "Dan Luu",
    url: "https://danluu.com/",
    category: "Tech",
    favouritePosts: ["https://danluu.com/p95-skill/"]
  },
  {
    name: "Kartikay",
    url: "https://kartikay.bearblog.dev/",
    description: "Writes digestible pieces about general tech and personal development.",
    category: "Tech"
  },
  {
    name: "Sourcegraph",
    url: "https://about.sourcegraph.com/blog",
    description: "General tech articles, I think I found it through Primeagen.",
    category: "Tech"
  },
  {
    name: "Yacine",
    url: "https://yacine.ca/",
    description: "Was fun to follow his journey building DingBoard (looks like hes taken it down now)",
    category: "Tech"
  },
  {
    name: "Nat Friedman",
    url: "https://nat.org/",
    description: "One of the best landing pages, incredibly succinct life mission.",
    category: "Tech"
  },
  {
    name: "Crypto Narratives (thedefivillain)",
    url: "https://substack.com/@cryptonarratives",
    description: "Crypto news and aggreageted all GCR quotes.",
    category: "Crypto",
    favouritePosts: ["https://cryptonarratives.substack.com/p/compilation-of-the-best-gcr-nuggets"]
  },
  {
    name: "Unenumerated (nickszabo)",
    url: "https://unenumerated.blogspot.com/",
    description: "Nick Szabo (Satoshi)",
    category: "Economics"
  },
  {
    name: "Jim Brown (jim3c5)",
    url: "https://substack.com/@jim3c5",
    description: "He has a lecture series on money I'd like to get into eventually.",
    category: "Economics"
  },
  {
    name: "Critical Fallibilism (Elliot Temple)",
    url: "https://criticalfallibilism.com/",
    description: "Philosophy project thats combining different epistomologies. Same author as: https://curi.us/",
    category: "Philosophy"
  },
  {
    name: "Lindy (PaulSkallas)",
    url: "https://lindynewsletter.beehiiv.com/",
    category: "Tech"
  },
  {
    name: "Scearpo",
    url: "https://twitter.com/Scearpo",
    description: "Hilarious long form takes on general news and crypto.",
    category: "Crypto"
  }
];
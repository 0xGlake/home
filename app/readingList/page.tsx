import React from 'react';
import Link from 'next/link';
import SpotifyEmbed  from '../components/SpotifyEmbed';


interface ReadingListItem {
  url: string;
  description?: string;
}

const readingList: ReadingListItem[] = [
  {
    url: "https://plaintextcapital.com/blog/",
    description: "",
  },
  {
    url: "https://danluu.com/",
    description: "",
  },
  {
    url: "http://www.paulgraham.com/articles.html",
    description: "",
  },
  {
    url: "https://unenumerated.blogspot.com/",
    description: "",
  },
  {
    url: "https://docs.google.com/document/d/18FiJbYn53fTtPmphfdCKT2TMWH-8Y2L-MLqDk-MFV4s/edit",
    description: "Career Mochary Method Curriculum",
  },
  {
    url: "https://www.ribbonfarm.com/",
    description: "Career and misc",
  },
  {
    url: "https://studio.ribbonfarm.com/p/superhistory-not-superintelligence",
    description: "Superhistory article",
  },
  {
    url: "https://goldenlight.mirror.xyz/",
    description: "Charlotte Fang",
  },
  {
    url: "https://notes.alexkehayias.com/",
    description: "Someone's Obsidian notes",
  },
  {
    url: "https://studio.ribbonfarm.com/",
    description: "More Ribbonfarm but on Substack",
  },
  {
    url: "https://booktwo.org/notebook",
    description: "Want to read more",
  },
  {
    url: "https://about.sourcegraph.com/blog",
    description: "AI in coding",
  },
  {
    url: "https://docs.google.com/document/d/18FiJbYn53fTtPmphfdCKT2TMWH-8Y2L-MLqDk-MFV4s/edit?pli=1",
    description: "Career, not blog but good resource",
  },
  {
    url: "https://innerwilds.inthewilderless.com/p/your-body-knows-whats-obvious-and",
    description: "Spiritual",
  },
  {
    url: "https://www.charlestew.com/",
    description: "Charles Tew",
  },
  {
    url: "https://bioenergetic.forum/",
    description: "Peat",
  },
  {
    url: "https://yacine.ca/",
    description: "Yacine",
  },
  {
    url: "https://near.blog/",
  },
  {
    url: "https://qualiacomputing.com/archives/",
  },
  {
    url: "https://tim.blog/",
    description: "Tim Ferriss",
  },
  {
    url: "https://t3uncoupled.substack.com/",
  },
  {
    url: "https://github.com/0xNineteen/blog.md",
    description: "0xNineteen",
  },
  {
    url: "https://backthebunny.substack.com/",
    description: "Crypto bull",
  },
  {
    url: "https://goodalexander.com/",
    description: "Me like",
  },
  {
    url: "https://steemit.com/bitcoin/@joseph/wolong-the-game-of-deception-unedited-version",
    description: "Stand alone essay on Wolong pump and dump",
  },
  {
    url: "https://www.adjacentresearch.xyz/list.html",
    description: "Look at lists",
  },
  {
    url: "https://adjacentresearch.substack.com/p/ramblings-on-event-markets",
  },
  {
    url: "https://cryptohayes.substack.com/",
    description: "Hayes",
  },
  {
    url: "https://www.workingtheorys.com/",
  },
  {
    url: "https://bitsofwonder.substack.com/",
  },
  {
    url: "https://sashachapin.substack.com/",
  },
  {
    url: "https://www.astralcodexten.com/",
    description: "Bay area house party",
  },
  {
    url: "https://curi.us/",
  },
  {
    url: "https://criticalfallibilism.com/",
    description: "Same writer but this is more around the philosophy he developed",
  },
  {
    url: "https://cryptonarratives.substack.com/p/compilation-of-the-best-gcr-nuggets",
  },
  {
    url: "https://www.reverie.ooo/post/protocol-economics-ignore-at-your-own-peril",
  },
  {
    url: "https://www.cyberpatterns.xyz/",
  },
  {
    url: "https://kartikay.bearblog.dev/",
  },
  {
    url: "https://www.notboring.co/",
  },
  {
    url: "https://nat.org/",
  },
  {
    url: "https://read.mindmine.xyz/",
  },
  {
    url: "https://twitter.com/isabelunraveled",
  },
  {
    url: "https://substack.com/@jim3c5",
  },
];

const ReadingListItem: React.FC<ReadingListItem> = ({ url, description }) => (
  <li className="mb-4">
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-blue-600 hover:text-blue-800 flex items-center"
    >
      {new URL(url).toString().replace('https://', '')}
    </a>
    {description && <p className="text-gray-600 text-sm mt-1">{description}</p>}
  </li>
);

export default function ReadingListPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="block text-5xl font-mono font-bold my-4 pl-5 pb-4 pt-5 hover:text-violet-400">
      &gt; Reading List maybe ill clean this up and order it if I feel like it 
      </Link>
      <h2 className="text-2xl font-bold my-6">Not necessarily in order and some are more read than others</h2>
      <ul className="space-y-4 pb-11">
        {readingList.map((item, index) => (
          <ReadingListItem key={index} {...item} />
        ))}
      </ul>
        <SpotifyEmbed />
    </div>
  );
}

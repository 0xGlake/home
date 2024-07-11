import React from 'react';
import Link from 'next/link';
import SpotifyEmbed  from '../components/SpotifyEmbed';
import { readingList, ReadingListItemStruct } from '../lib/ReadingListList';

const ReadingListItem: React.FC<ReadingListItemStruct> = ({ url, description, category, favouritePosts, name }) => (
  <li className="mb-4 overflow-x-auto whitespace-nowrap">
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="hover:underline inline-flex min-w-full items-baseline hover:text-violet-400"
    >
      <span className="flex-grow text-xl">
        {name}
      </span>
      <span className="ml-2 text-sm text-gray-500 italic">({category})</span>
    </a>
    {description && (
      <p className="text-gray-600 text-sm mt-1 break-words whitespace-normal">
        {description}
      </p>
    )}
    {favouritePosts && favouritePosts.length > 0 && (
      <ul className="mt-2 space-y-1">
        {favouritePosts.map((post, index) => (
          <li key={index} className="text-sm text-gray-500">
            <a 
              href={post} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-violet-400 hover:text-violet-200 inline-flex items-center"
            >
              {new URL(post).toString().replace('https://', '')}
            </a>
          </li>
        ))}
      </ul>
    )}  
  </li>
);

export default function ReadingListPage() {
  return (
    // centered on page
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/" className="block text-5xl font-mono font-bold my-4 pb-4 pt-4 hover:text-violet-400">
      &gt; Reading List
      </Link>
      <ul className="space-y-8 pb-11">
        {readingList.map((item, index) => (
          <ReadingListItem key={index} {...item} />
        ))}
      </ul>
      Easter Egg:
        <SpotifyEmbed />
    </div>
  );
}

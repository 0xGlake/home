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
    <span className="flex-grow text-xl inline-flex items-center">
      <svg width="16px" height="16px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" className="mr-1">
        <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g id="Link">
            <rect id="Rectangle" fillRule="nonzero" x="0" y="0" width="24" height="24"></rect>
            <path d="M14,16 L17,16 C19.2091,16 21,14.2091 21,12 L21,12 C21,9.79086 19.2091,8 17,8 L14,8" id="Path" className="stroke-white group-hover:stroke-violet-400" strokeWidth="2" strokeLinecap="round"></path>
            <path d="M10,16 L7,16 C4.79086,16 3,14.2091 3,12 L3,12 C3,9.79086 4.79086,8 7,8 L10,8" id="Path" className="stroke-white group-hover:stroke-violet-400" strokeWidth="2" strokeLinecap="round"></path>
            <line x1="7.5" y1="12" x2="16.5" y2="12" id="Path" className="stroke-white group-hover:stroke-violet-400" strokeWidth="2" strokeLinecap="round"></line>
          </g>
        </g>
      </svg>
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
              &gt; {new URL(post).toString().replace('https://', '')}
            </a>
          </li>
        ))}
      </ul>
    )}  
  </li>
);

export default function ReadingListPage() {
  return (
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

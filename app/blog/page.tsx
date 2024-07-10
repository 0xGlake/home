import React from 'react';
import { getBlogPosts } from '../lib/GetBlogPosts';
import Link from 'next/link';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-GB', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export default function BlogPage() {
  const posts = getBlogPosts();
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/" className="block text-5xl font-mono font-bold my-2 pl-5 pt-5 hover:text-violet-400">
        Blog
      </Link>
      <ul className="space-y-2 mt-4">
        {posts.map((post) => (
          <li key={post.slug} className="overflow-x-auto whitespace-nowrap">
            <Link href={`/blog/${post.slug}`} className="hover:underline inline-flex min-w-full items-baseline hover:text-violet-400">
              <span className="w-28 italic flex-shrink-0 text-sm text-gray-500 text-right pr-4">
                {formatDate(post.date)}
              </span>
              <span className="flex-grow">
                {post.title}
                <span className="ml-2 text-sm text-gray-500 italic">({post.category})</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

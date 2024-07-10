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
      <h1 className="text-3xl font-mono font-bold mb-8 pl-5">Blog Posts</h1>
      <Link href="/" className="text-gray-300 hover:text-violet-400 font-mono hover:underline pl-5">Home</Link>
      <ul className="space-y-2 mt-4">
        {posts.map((post) => (
          <li key={post.slug} className="overflow-x-auto whitespace-nowrap">
            <Link href={`/blog/${post.slug}`} className="hover:underline inline-flex min-w-full items-baseline hover:text-violet-400">
              <span className="w-28 flex-shrink-0 text-sm text-gray-500 text-right pr-4">
                {formatDate(post.date)}
              </span>
              <span className="flex-grow">
                {post.title}
                <span className="ml-2 text-sm text-gray-500">({post.category})</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

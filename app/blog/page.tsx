import React from 'react';
import { getBlogPosts } from '../lib/GetBlogPosts';
import BlogCard from '../components/BlogCard';

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Blog Posts</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard
            key={post.slug}
            slug={post.slug}
            title={post.title}
            date={post.date}
            category={post.category}
          />
        ))}
      </div>
    </div>
  );
}
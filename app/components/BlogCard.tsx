import React from 'react';
import Link from 'next/link';

interface BlogCardProps {
  slug: string;
  title: string;
  date: string;
  category: string;
}

const BlogCard: React.FC<BlogCardProps> = ({ slug, title, date, category }) => {
  return (
    <Link href={`/blog/${slug}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 mb-2">{new Date(date).toLocaleDateString()}</p>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {category}
        </span>
      </div>
    </Link>
  );
};

export default BlogCard;
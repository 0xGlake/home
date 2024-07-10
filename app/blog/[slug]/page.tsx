import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

interface BlogPostProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), 'app', 'content', 'blog');
  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames.map((fileName) => ({
    slug: fileName.replace(/\.md$/, ''),
  }));
}

export default function BlogPost({ params }: BlogPostProps) {
  const { slug } = params;
  const filePath = path.join(process.cwd(), 'app', 'content', 'blog', `${slug}.md`);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  var { data, content } = matter(fileContents);

  return (
    <div className="container mx-auto px-4 py-8 xs:w-full sm:w-9/12 md:w-8/12 lg:w-7/12 xl:w-5/12">
      <Link href="/blog" className="block text-3xl font-mono font-bold mb-4 hover:text-violet-400">
        {data.title}
      </Link>
      <div className="mb-4">
        <span className="text-gray-600 mr-4">{new Date(data.date).toLocaleDateString()}</span>
        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {data.category}
        </span>
      </div>
      <div className="max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

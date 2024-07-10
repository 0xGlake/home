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

const customRenderers = {
  h1: ({ node, ...props }: any) => <h1 className="text-4xl font-bold mt-6 mb-4" {...props} />,
  h2: ({ node, ...props }: any) => <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />,
  h3: ({ node, ...props }: any) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
  p: ({ node, ...props }: any) => <p className="mb-4" {...props} />,
  ul: ({ node, ...props }: any) => <ul className="list-disc pl-5 mb-4" {...props} />,
  ol: ({ node, ...props }: any) => <ol className="list-decimal pl-5 mb-4" {...props} />,
  li: ({ node, ...props }: any) => <li className="mb-2" {...props} />,
  a: ({ node, ...props }: any) => <a className="text-blue-600 hover:underline" {...props} />,
  table: ({node, ...props}: any) => <table className="border-collapse table-auto w-full" {...props} />,
  tableCell: ({node, ...props}: any) => <td className="border px-4 py-2" {...props} />,
  tableRow: ({node, ...props}: any) => <tr className="bg-gray-100" {...props} />,
  del: ({node, ...props}: any) => <del className="line-through" {...props} />,
  blockquote: ({ node, ...props }: any) => (
    <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />
  ),
  code: ({ node, inline, ...props }: any) => 
    inline ? (
      <code className="bg-gray-100 rounded px-1 py-0.5" {...props} />
    ) : (
      <code className="block bg-gray-100 rounded p-2 my-2 overflow-x-auto" {...props} />
    ),
};

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
  const { data, content } = matter(fileContents);

  return (
    <div className="container mx-auto px-4 py-8 xs:w-full sm:w-9/12 md:w-8/12 lg:w-7/12 xl:w-5/12">
      <Link href="/" className="block text-3xl font-mono font-bold mb-4 hover:text-violet-400">
      &gt; 0xGlake @('_')@
      </Link>
      <Link href="/blog" className="block text-2xl font-mono font-bold mb-4 hover:text-violet-400 text-gray-400">
      Blog
      </Link>
      <div className="mb-4">
        <span className="text-gray-600 mr-4">{new Date(data.date).toLocaleDateString()}</span>
        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {data.category}
        </span>
      </div>
      <div className="prose max-w-none">
        <ReactMarkdown components={customRenderers} remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

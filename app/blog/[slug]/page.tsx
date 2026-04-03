import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { customRenderers } from '../../lib/CustomRenderers';
import CanvasPost from './CanvasPost';

interface BlogPostProps {
  params: {
    slug: string;
  };
}

const CANVAS_SLUG_PREFIX = 'canvas-';

function resolvePost(slug: string): { type: "markdown"; slug: string } | { type: "canvas"; canvasFile: string; title?: string } {
  if (slug.startsWith(CANVAS_SLUG_PREFIX)) {
    const canvasName = slug.slice(CANVAS_SLUG_PREFIX.length);
    const canvasPath = path.join(process.cwd(), 'public', 'canvas', `${canvasName}.canvas`);
    if (fs.existsSync(canvasPath)) {
      const data = JSON.parse(fs.readFileSync(canvasPath, 'utf8'));
      return { type: "canvas", canvasFile: `${canvasName}.canvas`, title: data.title };
    }
  }
  return { type: "markdown", slug };
}

export async function generateStaticParams() {
  const params: { slug: string }[] = [];

  const postsDirectory = path.join(process.cwd(), 'app', 'content', 'blog');
  const mdFiles = fs.readdirSync(postsDirectory);
  for (const filename of mdFiles) {
    if (filename.endsWith('.md')) {
      params.push({ slug: filename.replace(/\.md$/, '') });
    }
  }

  const canvasDirectory = path.join(process.cwd(), 'public', 'canvas');
  try {
    const canvasFiles = fs.readdirSync(canvasDirectory);
    for (const filename of canvasFiles) {
      if (filename.endsWith('.canvas')) {
        params.push({ slug: CANVAS_SLUG_PREFIX + filename.replace(/\.canvas$/, '') });
      }
    }
  } catch {}

  return params;
}

export default function BlogPost({ params }: BlogPostProps) {
  const post = resolvePost(params.slug);

  if (post.type === "canvas") {
    return (
      <div className="h-screen flex flex-col" style={{ background: "rgb(16, 16, 16)" }}>
        <div className="px-4 py-3 flex items-center gap-4">
          <Link href="/blog" className="text-lg font-mono font-bold text-violet-400 hover:text-violet-300">
            &lt; Blog
          </Link>
          {post.title && (
            <span className="text-gray-400 font-mono text-sm">{post.title}</span>
          )}
        </div>
        <CanvasPost canvasFile={post.canvasFile} />
      </div>
    );
  }

  const filePath = path.join(process.cwd(), 'app', 'content', 'blog', `${post.slug}.md`);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  return (
    <div className="container mx-auto px-4 py-8 xs:w-full sm:w-9/12 md:w-8/12 lg:w-7/12 xl:w-5/12">
      <Link href="/" className="block text-3xl font-mono font-bold mb-4 hover:text-violet-400">
      &gt; 0xGlake @(&#39;_&#39;)@
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

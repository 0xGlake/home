import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { customRenderers } from '../../lib/CustomRenderers';
import { componentPosts, getComponentPost } from '../../lib/ComponentPosts';
import CanvasPost from './CanvasPost';
import TaxonomyMap from '../../components/taxonomy/TaxonomyMap';
import { HighlightProvider } from '../../components/taxonomy/HighlightContext';
import HighlightToggle from '../../components/taxonomy/HighlightToggle';

interface BlogPostProps {
  params: Promise<{
    slug: string;
  }>;
}

const CANVAS_SLUG_PREFIX = 'canvas-';

type ResolvedPost =
  | { type: "markdown"; slug: string }
  | { type: "canvas"; canvasFile: string; title?: string }
  | { type: "component"; slug: string; title: string };

function resolvePost(slug: string): ResolvedPost {
  if (slug.startsWith(CANVAS_SLUG_PREFIX)) {
    const canvasName = slug.slice(CANVAS_SLUG_PREFIX.length);
    const canvasPath = path.join(process.cwd(), 'public', 'canvas', `${canvasName}.canvas`);
    if (fs.existsSync(canvasPath)) {
      const data = JSON.parse(fs.readFileSync(canvasPath, 'utf8'));
      return { type: "canvas", canvasFile: `${canvasName}.canvas`, title: data.title };
    }
  }

  const component = getComponentPost(slug);
  if (component) {
    return { type: "component", slug, title: component.title };
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

  for (const cp of componentPosts) {
    params.push({ slug: cp.slug });
  }

  return params;
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = resolvePost(slug);

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

  if (post.type === "component") {
    const isTaxonomy = post.slug === "crypto-taxonomy";
    return (
      <HighlightProvider>
        <div style={{ background: "rgb(16, 16, 16)", minHeight: "100vh" }}>
          <div className="px-4 py-3 flex items-center gap-4">
            <Link href="/blog" className="text-lg font-mono font-bold text-violet-400 hover:text-violet-300">
              &lt; Blog
            </Link>
            <span className="text-gray-400 font-mono text-sm">{post.title}</span>
            <div className="ml-auto flex items-center gap-3">
              {isTaxonomy && <HighlightToggle />}
              <a
                href="https://x.com/0xGlake"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/40 bg-violet-500/10 px-3.5 py-1.5 font-mono text-sm font-medium text-violet-300 shadow-sm shadow-violet-500/10 transition-all duration-150 hover:border-violet-400/60 hover:bg-violet-500/20 hover:text-violet-100 active:scale-[0.97]"
              >
                Submit a protocol
                <span aria-hidden className="text-violet-400/70">
                  ↗
                </span>
              </a>
            </div>
          </div>
          {isTaxonomy && <TaxonomyMap />}
        </div>
      </HighlightProvider>
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

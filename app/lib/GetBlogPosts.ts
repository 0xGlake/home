import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  type: "markdown" | "canvas";
}

export function getBlogPosts(): BlogPost[] {
  const posts: BlogPost[] = [];

  // Read markdown posts
  const postsDirectory = path.join(process.cwd(), 'app', 'content', 'blog');
  const mdFileNames = fs.readdirSync(postsDirectory);
  for (const fileName of mdFileNames) {
    if (!fileName.endsWith('.md')) continue;
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);
    posts.push({
      slug,
      title: data.title,
      date: data.date,
      category: data.category,
      type: "markdown",
    });
  }

  // Read canvas posts
  const canvasDirectory = path.join(process.cwd(), 'public', 'canvas');
  try {
    const canvasFileNames = fs.readdirSync(canvasDirectory);
    for (const fileName of canvasFileNames) {
      if (!fileName.endsWith('.canvas')) continue;
      const slug = 'canvas-' + fileName.replace(/\.canvas$/, '');
      const fullPath = path.join(canvasDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const data = JSON.parse(fileContents);
      posts.push({
        slug,
        title: data.title || fileName.replace(/\.canvas$/, ''),
        date: data.date || new Date().toISOString().split('T')[0],
        category: data.category || "canvas",
        type: "canvas",
      });
    }
  } catch {
    // canvas directory might not exist yet
  }

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: string;
}

export function getBlogPosts(): BlogPost[] {
  const postsDirectory = path.join(process.cwd(), 'app', 'content', 'blog');
  const fileNames = fs.readdirSync(postsDirectory);

  const posts = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);

    return {
      slug,
      title: data.title,
      date: data.date,
      category: data.category,
    };
  });

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}
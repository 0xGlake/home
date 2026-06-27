import yaml from 'js-yaml';

interface Frontmatter {
  // Frontmatter is trusted, in-repo content; mirror gray-matter's loose typing
  // so existing call sites keep working without casts.
  [key: string]: any;
}

interface ParsedFile {
  data: Frontmatter;
  content: string;
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/**
 * Minimal replacement for gray-matter: splits leading `---` YAML frontmatter
 * from the markdown body. Only used on trusted, in-repo content.
 */
export function parseFrontmatter(fileContents: string): ParsedFile {
  const match = fileContents.match(FRONTMATTER_RE);
  if (!match) {
    return { data: {}, content: fileContents };
  }

  const parsed = yaml.load(match[1]);
  const data =
    parsed && typeof parsed === 'object' ? (parsed as Frontmatter) : {};
  const content = fileContents.slice(match[0].length);
  return { data, content };
}

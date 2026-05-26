import * as fs from "node:fs/promises";
import * as path from "node:path";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';

type Post = {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  date: Date;
}

const marked = new Marked(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);

function extractTitle(markdown: string): string {
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  return titleMatch?.[1] ?? "Untitled";
}

function stripTopLevelTitle(markdown: string): string {
  return markdown.replace(/^#\s+.+$(\n\s*)?/m, "").trim();
}

function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/^#\s+.+$/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[>*_-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractExcerpt(markdown: string): string {
  const withoutTitle = markdown.replace(/^#\s+.+$(\n)?/m, "").trim();
  const paragraphs = withoutTitle
    .split(/\n\s*\n/)
    .map((paragraph) => stripMarkdown(paragraph))
    .filter(Boolean);

  const excerpt = paragraphs[0] ?? "";

  if (excerpt.length <= 180) {
    return excerpt;
  }

  return `${excerpt.slice(0, 177).trimEnd()}...`;
}

function extractDateFromFilename(filename: string): Date {
  const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})-/)!;

  if (!match) {
    throw new Error(`Filename does not start with YYYY-MM-DD-: ${filename}`);
  }

  const dateStr = `${match[1]}-${match[2]}-${match[3]}`;
  const date = new Date(dateStr);

  return date;
}

async function getPosts(): Promise<Post[]> {
  const contentDir = "./content/posts";
  const files = await fs.readdir(contentDir);
  const mdFiles = files.filter((file) => file.endsWith(".md"));

  const posts: Post[] = [];
  for (const file of mdFiles) {
    const filePath = path.join(contentDir, file);
    const markdownContent = await fs.readFile(filePath, "utf-8");
    const title = extractTitle(markdownContent);
    const excerpt = extractExcerpt(markdownContent);
    const content = await marked.parse(stripTopLevelTitle(markdownContent));
    const slug = path.basename(file, ".md");
    const date = extractDateFromFilename(slug);

    posts.push({ slug, title, content, excerpt, date });
  }

  return posts;
}

export { getPosts };
export type { Post };

import * as fs from "node:fs/promises";
import * as path from "node:path";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';

type Post = {
  slug: string;
  title: string;
  content: string;
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
    const content = await marked.parse(markdownContent);
    const slug = path.basename(file, ".md");
    const date = extractDateFromFilename(slug);

    posts.push({ slug, title, content, date });
  }

  return posts;
}

export { getPosts };
export type { Post };

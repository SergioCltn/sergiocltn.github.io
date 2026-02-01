import type { Post } from "./posts.ts";

const site_url = 'https://sergiocltn.github.io/';
const general_description = 'Personal blog of SergioCltn';

type BaseProps = {
  title: string;
  children: string;
  description: string;
  path: string;
  extra_css?: string;
}

function Base({ title, children, path, description, extra_css }: BaseProps) {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      ${`<meta name="description" content="${description}" />`}
      ${`<link rel="canonical" href=${site_url}${path} />`}
      <link rel="icon" type="image/x-icon" href="/favicon.ico">
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
      <link rel="stylesheet" href="/styles/common.css">
      <link rel="stylesheet" href="/styles/highlight.css">
      ${extra_css ? `<link rel="stylesheet" href="/styles/${extra_css}" />` : ''}
    </head>
    <body>
        <header>
          <nav>
            <a class="title" href="/">SergioCltn</a>
          </nav>
        </header>
        <main>
          ${children}
        </main>
        <footer>
          <a href="https://github.com/sergiocltn">
            <svg width="20" height="20" fill="currentColor">
            <use href="/assets/icons.svg#github" />
            </svg>
            SergioCltn
          </a>
        </footer>
    </body>
  </html>`;
}

export function PostList(posts: Post[]): string {
  const PostListContent =
    `<ul>
      ${posts
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .map((post) => `
          <li>
            <p>${post.date.toISOString().split("T")[0]}</p>
            <a href="/posts/${post.slug}.html">${post.title}</a>
          </li>
        `)
      .join("")
    }
    </ul>`;


  return Base({
    children: PostListContent,
    title: 'SergioCltn',
    path: '',
    description: general_description,
    extra_css: 'postlist.css'
  });
}

export function PostPage(post: Post): string {
  return Base({
    children: post.content,
    title: post.title,
    path: post.slug,
    description: general_description,
    extra_css: 'post.css'
  });
}

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
      <div class="container">
        <header class="header">
          <div class="header__inner">
            <div class="header__logo">
              <a href="/" class="logo-link">
                <div class="logo">sergiocltn.github.io</div>
              </a>
            </div>
          </div>
          <nav class="menu">
            <ul class="menu__inner">
              <li><a href="/">blog</a></li>
              <li><a href="/about.html">about me</a></li>
            </ul>
          </nav>
        </header>
        <main class="content">
          ${children}
        </main>
        <footer class="footer">
          <div class="footer__inner">
            <div class="copyright">
              <a href="https://github.com/sergiocltn">
                <svg width="20" height="20" fill="currentColor">
                  <use href="/assets/icons.svg#github" />
                </svg>
                SergioCltn
              </a>
            </div>
          </div>
        </footer>
      </div>
    </body>
  </html>`;
}

export function PostList(posts: Post[]): string {
  const PostListContent =
    `<div class="posts">
      ${posts
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .map((post) => `
          <article class="post on-list">
            <h1 class="post-title"><a href="/posts/${post.slug}.html">${post.title}</a></h1>
            <div class="post-meta-inline">
              <span class="post-date">${post.date.toISOString().split("T")[0]}</span>
            </div>
            <div class="post-content">
              <p>${post.excerpt}</p>
            </div>
            <div>
              <a class="read-more button" href="/posts/${post.slug}.html">
                <span class="button__text">Read more</span>&nbsp;
                <span class="button__icon">&#8617;&#xFE0E;</span>
              </a>
            </div>
          </article>
        `)
      .join("")
    }
    </div>`;


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
    children: `<article class="post">${post.content}</article>`,
    title: post.title,
    path: `posts/${post.slug}.html`,
    description: general_description,
    extra_css: 'post.css'
  });
}

export function AboutPage(content: string): string {
  return Base({
    children: `<article class="post">${content}</article>`,
    title: 'About',
    path: 'about.html',
    description: general_description,
    extra_css: 'post.css'
  });
}

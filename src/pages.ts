import type { Post } from "./posts.ts";

const TITLE = "sergiocltn";

export function generateHomepage(posts: Post[]): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${TITLE}</title>
      <link rel="stylesheet" href="/styles/common.css">
      <link rel="stylesheet" href="/styles/home.css">
    </head>
    <body>
      <h1>SergioCltn</h1>
      <ul>
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
      </ul>
    </body>
  </html>`;
}

export function generatePostPage(post: Post): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${post.title}</title>
      <link rel="stylesheet" href="/styles/common.css">
      <link rel="stylesheet" href="/styles/post.css">
      <link rel="stylesheet" href="/styles/highlight.css">
    </head>
    <body>
      <a href="/" class="back-link">← Back to home</a>
      ${post.content}
    </body>
  </html>`;
}

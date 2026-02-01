import * as fs from "node:fs/promises";
import * as pages from "./pages";
import { getPosts } from "./posts";
import { parseArgs } from "node:util";

function printHelp() {
  console.log(`
Usage: bun run src/main.ts [options]

Options:
  -h, --help            Show this help message
  --touch <slug>        Create new post file from template

Examples:
  bun run src/main.ts                   # run build
  bun run src/main.ts --touch my-idea   # create 2026-01-31-my-idea.md
  bun run src/main.ts -h
  `);
}

async function build() {
  console.log("Building blog...");

  await fs.mkdir("./dist", { recursive: true });
  await fs.mkdir("./dist/posts", { recursive: true });
  await fs.mkdir("./dist/styles", { recursive: true });

  await fs.cp(
    "./content/styles",
    "./dist/styles",
    { recursive: true }
  );

  await fs.cp(
    "./content/assets",
    "./dist/assets",
    { recursive: true }
  );

  await fs.copyFile("./content/favicon.ico", "./dist/favicon.ico");
  await fs.copyFile("./content/favicon-16x16.png", "./dist/favicon-16x16.png");
  await fs.copyFile("./content/favicon-32x32.png", "./dist/favicon-32x32.png");

  console.log("Copied CSS, favicon files and assets");

  const posts = await getPosts();
  console.log(`Found ${posts.length} posts`);

  const homepage = pages.PostList(posts);
  await fs.writeFile("./dist/index.html", homepage);
  console.log("Generated index.html");

  for (const post of posts) {
    const postPage = pages.PostPage(post);
    await fs.writeFile(`./dist/posts/${post.slug}.html`, postPage);
    console.log(`Generated posts/${post.slug}.html`);
  }

  console.log("Build complete!");
}

async function main() {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      help: { type: "boolean", short: "h" },
      touch: { type: "string" },
    },
    strict: true,
  });

  if (values.help) {
    printHelp();
    return;
  }

  if (values.touch) {
    const date = new Date().toISOString().split("T")[0];
    const slug = values.touch;
    const path = `./content/posts/${date}-${slug}.md`;

    await fs.copyFile("./content/template.md", path);
    console.log(`Touched file: ${path}`);
    return;
  }

  await build();
}

await main();

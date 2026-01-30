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

  console.log("Copied CSS files");

  const posts = await getPosts();
  console.log(`Found ${posts.length} posts`);

  const homepage = pages.generateHomepage(posts);
  await fs.writeFile("./dist/index.html", homepage);
  console.log("Generated index.html");

  for (const post of posts) {
    const postPage = pages.generatePostPage(post);
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

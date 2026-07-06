#!/usr/bin/env node
import { createContentFile, parseTags, resolveCollection } from "./content-utils.mjs";

function printUsage() {
  console.log(`Usage:
  npm run new:blog -- "文章标题"
  npm run new:note -- "笔记标题"
  npm run new:project -- "项目标题"
  npm run new:tool -- "工具标题"

Options:
  --slug custom-slug
  --draft
  --tags "AI,Astro,排障"

Npm-friendly options:
  draft=true
  slug=custom-slug
  "tags=AI,Astro,排障"`);
}

function parseArgs(argv) {
  const [collection, ...rest] = argv;
  const options = {
    collection: resolveCollection(collection)?.key,
    titleParts: [],
    slug: "",
    draft: false,
    tags: undefined
  };

  for (let index = 0; index < rest.length; index += 1) {
    const value = rest[index];
    if (value.includes("=") && !value.startsWith("=")) {
      const [key, ...rawValueParts] = value.split("=");
      const rawValue = rawValueParts.join("=").trim();
      if (key === "slug") {
        options.slug = rawValue;
      } else if (key === "draft") {
        options.draft = ["1", "true", "yes", "on"].includes(rawValue.toLowerCase());
      } else if (key === "tags") {
        options.tags = parseTags(rawValue);
      } else {
        options.titleParts.push(value);
      }
    } else if (value === "--slug") {
      options.slug = rest[index + 1] ?? "";
      index += 1;
    } else if (value === "--draft") {
      options.draft = true;
    } else if (value === "--tags") {
      options.tags = parseTags(rest[index + 1] ?? "");
      index += 1;
    } else {
      options.titleParts.push(value);
    }
  }

  return {
    ...options,
    title: options.titleParts.join(" ").trim()
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.collection || !args.title) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  try {
    const output = await createContentFile(args);
    console.log(`Created ${output.collection}: ${output.filePath}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

await main();

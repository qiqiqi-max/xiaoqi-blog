import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

export const collectionConfigs = {
  blog: {
    dir: "src/content/blog",
    type: "blog",
    category: "长期写作",
    tags: ["写作"],
    body: `## 背景

这里写这篇文章要解决的问题、读者背景和核心结论。

## 正文

把长期观点、教程、复盘或技术说明写在这里。

## 结论

留下可以被以后引用的结论和下一步行动。`
  },
  notes: {
    dir: "src/content/notes",
    type: "note",
    category: "短笔记",
    tags: ["笔记"],
    body: `## 记录

这里写问题、现象、命令、链接或临时想法。

## 处理

记录你做了什么，以及结果如何。

## 以后再看

补充后续需要确认的点。`
  },
  projects: {
    dir: "src/content/projects",
    type: "project",
    category: "项目",
    tags: ["项目"],
    stack: ["Astro", "TypeScript"],
    status: "building",
    body: `## 目标

这个项目要解决什么问题。

## 技术栈

- Astro
- TypeScript

## 进展

记录当前状态、完成内容和下一步计划。

## 复盘

沉淀值得以后复用的经验。`
  },
  tools: {
    dir: "src/content/tools",
    type: "tool",
    category: "工具箱",
    tags: ["工具箱"],
    body: `## 用途

这个工具解决什么问题。

## 安装和位置

记录安装路径、配置路径、启动方式或迁移位置。

## 常用操作

写下最常用的命令、链接或注意事项。`
  }
};

const collectionAliases = {
  blog: "blog",
  post: "blog",
  note: "notes",
  notes: "notes",
  project: "projects",
  projects: "projects",
  tool: "tools",
  tools: "tools"
};

export function resolveCollection(value) {
  const key = collectionAliases[String(value || "").trim()];
  if (!key) {
    return undefined;
  }
  return { key, config: collectionConfigs[key] };
}

export function parseTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  const text = String(value || "").trim();
  if (!text) {
    return [];
  }

  const separator = text.includes(",") || text.includes("，") ? /[,，]/ : /\s+/;
  return text
    .split(separator)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function today() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return formatter.format(now);
}

export function slugify(input, fallback) {
  const ascii = String(input || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  if (ascii) {
    return ascii;
  }

  const digest = createHash("sha1").update(String(input || fallback)).digest("hex").slice(0, 8);
  return `${fallback}-${digest}`;
}

function yamlString(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function yamlArray(values) {
  return `[${values.map(yamlString).join(", ")}]`;
}

function optionalUrlLine(name, value) {
  const text = String(value || "").trim();
  return text ? `${name}: ${yamlString(text)}` : undefined;
}

export function buildMdx(input) {
  const resolved = resolveCollection(input.collection);
  if (!resolved) {
    throw new Error("Unknown content collection.");
  }

  const { config } = resolved;
  const title = String(input.title || "").trim();
  if (!title) {
    throw new Error("Title is required.");
  }

  const date = String(input.date || today()).trim();
  const description = String(input.description || `${title} 的记录和整理。`).trim();
  const tags = parseTags(input.tags).length ? parseTags(input.tags) : config.tags;
  const category = String(input.category || config.category).trim();
  const summary = String(input.summary || `${title} 的要点摘要。`).trim();
  const language = ["zh", "en", "ja"].includes(input.language) ? input.language : "zh";
  const body = String(input.body || config.body).replace(/\s+$/g, "");

  const lines = [
    "---",
    `title: ${yamlString(title)}`,
    `description: ${yamlString(description)}`,
    `date: ${date}`,
    `tags: ${yamlArray(tags)}`,
    `category: ${yamlString(category)}`,
    `draft: ${input.draft ? "true" : "false"}`,
    `featured: ${input.featured ? "true" : "false"}`,
    `summary: ${yamlString(summary)}`,
    `language: ${language}`,
    `type: ${yamlString(config.type)}`
  ];

  if (resolved.key === "projects") {
    const allowedStatus = ["planning", "building", "maintained", "archived"];
    const status = allowedStatus.includes(input.status) ? input.status : config.status;
    const stack = parseTags(input.stack).length ? parseTags(input.stack) : config.stack;
    lines.push(`status: ${status}`);
    lines.push(`stack: ${yamlArray(stack)}`);
    lines.push(optionalUrlLine("repo", input.repo));
    lines.push(optionalUrlLine("demo", input.demo));
  }

  if (resolved.key === "tools") {
    lines.push(optionalUrlLine("link", input.link));
  }

  lines.push("---");
  return `${lines.filter(Boolean).join("\n")}\n\n${body}\n`;
}

export function buildContentFile(input) {
  const resolved = resolveCollection(input.collection);
  if (!resolved) {
    throw new Error("Unknown content collection.");
  }

  const title = String(input.title || "").trim();
  if (!title) {
    throw new Error("Title is required.");
  }

  const date = String(input.date || today()).trim();
  const slug = slugify(input.slug || title, resolved.key);
  const fileName = `${date}-${slug}.mdx`;
  const filePath = join(rootDir, resolved.config.dir, fileName);
  const content = buildMdx({ ...input, date });

  return {
    collection: resolved.key,
    fileName,
    filePath,
    slug,
    content
  };
}

export async function createContentFile(input) {
  const output = buildContentFile(input);
  if (existsSync(output.filePath) && !input.overwrite) {
    const error = new Error(`File already exists: ${output.filePath}`);
    error.code = "EEXIST";
    throw error;
  }

  await mkdir(dirname(output.filePath), { recursive: true });
  await writeFile(output.filePath, output.content, "utf8");
  return output;
}

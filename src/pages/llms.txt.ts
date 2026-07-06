import { getAllPublishedContent, getEntryTags } from "@/lib/content";
import { site } from "@/lib/site";

const collectionLabels: Record<string, string> = {
  blog: "博客",
  notes: "笔记",
  projects: "项目",
  tools: "工具箱"
};

function hrefFor(entry: any) {
  const map: Record<string, string> = {
    blog: "blog",
    notes: "notes",
    projects: "projects",
    tools: "tools"
  };
  return new URL(`/${map[entry.collection]}/${entry.id}/`, site.url).toString();
}

export async function GET() {
  const entries = await getAllPublishedContent();
  const lines = [
    `# ${site.name}`,
    "",
    site.description,
    "",
    "## 内容索引",
    ""
  ];

  for (const entry of entries) {
    const label = collectionLabels[entry.collection] ?? entry.collection;
    const tags = getEntryTags(entry).join(", ");
    lines.push(`- [${entry.data.title}](${hrefFor(entry)})`);
    lines.push(`  - 栏目：${label}`);
    lines.push(`  - 摘要：${entry.data.description}`);
    if (tags) lines.push(`  - 标签：${tags}`);
  }

  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}

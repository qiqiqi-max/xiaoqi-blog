import { getCollection, type CollectionEntry } from "astro:content";

type AnyEntry =
  | CollectionEntry<"blog">
  | CollectionEntry<"notes">
  | CollectionEntry<"projects">
  | CollectionEntry<"tools">;

export async function getPublishedBlog() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getPublishedNotes() {
  const notes = await getCollection("notes", ({ data }) => !data.draft);
  return notes.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getPublishedProjects() {
  const projects = await getCollection("projects", ({ data }) => !data.draft);
  return projects.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getPublishedTools() {
  const tools = await getCollection("tools", ({ data }) => !data.draft);
  return tools.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getAllPublishedContent(): Promise<AnyEntry[]> {
  const [blog, notes, projects, tools] = await Promise.all([
    getPublishedBlog(),
    getPublishedNotes(),
    getPublishedProjects(),
    getPublishedTools()
  ]);
  return [...blog, ...notes, ...projects, ...tools].sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );
}

export function getEntryTags(entry: AnyEntry) {
  const stack = "stack" in entry.data ? entry.data.stack : [];
  return [...new Set([...entry.data.tags, ...stack])];
}

export function getAllTags(entries: AnyEntry[]) {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of getEntryTags(entry)) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
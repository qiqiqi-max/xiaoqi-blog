export const site = {
  name: import.meta.env.PUBLIC_SITE_NAME || "小七的 AI 知识花园",
  description: import.meta.env.PUBLIC_SITE_DESCRIPTION || "小七的 AI 驱动个人数字花园，沉淀博客、笔记、项目和工具箱。",
  url: import.meta.env.PUBLIC_SITE_URL || "https://example.com",
  author: import.meta.env.PUBLIC_AUTHOR_NAME || "小七"
};

export const navItems = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/notes", label: "笔记" },
  { href: "/projects", label: "项目" },
  { href: "/tools", label: "工具箱" },
  { href: "/studio", label: "创作台" },
  { href: "/tags", label: "标签" },
  { href: "/about", label: "关于" }
];

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(date));
}

export function readingTime(body = "") {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const cjk = (body.match(/[\u4e00-\u9fff]/g) || []).length;
  const minutes = Math.max(1, Math.ceil((words + cjk / 2) / 240));
  return `约 ${minutes} 分钟读完`;
}

export function slugifyTag(tag: string) {
  return tag.trim().toLowerCase();
}

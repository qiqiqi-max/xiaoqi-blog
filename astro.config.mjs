import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import { defineConfig } from "astro/config";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const site = process.env.PUBLIC_SITE_URL || "https://example.com";

export default defineConfig({
  site,
  integrations: [
    mdx(),
    sitemap()
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkGfm, remarkMath],
      rehypePlugins: [rehypeKatex]
    }),
    shikiConfig: {
      theme: "github-dark-dimmed",
      wrap: true
    }
  },
  experimental: {
    clientPrerender: true
  },
  vite: {
    server: {
      fs: {
        allow: ["."]
      }
    }
  }
});
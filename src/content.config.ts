import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const baseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().default("通用"),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
  summary: z.string().optional(),
  aiSummary: z.string().optional(),
  aiGenerated: z.boolean().default(false),
  language: z.enum(["zh", "en", "ja"]).default("zh"),
  cover: z.string().optional(),
  canonical: z.string().url().optional()
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: baseSchema.extend({
    type: z.literal("blog").default("blog"),
    jsonLd: z.record(z.any()).optional()
  })
});

const notes = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/notes" }),
  schema: baseSchema.extend({
    type: z.literal("note").default("note")
  })
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: baseSchema.extend({
    type: z.literal("project").default("project"),
    status: z.enum(["planning", "building", "maintained", "archived"]).default("building"),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    stack: z.array(z.string()).default([])
  })
});

const tools = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/tools" }),
  schema: baseSchema.extend({
    type: z.literal("tool").default("tool"),
    link: z.string().url().optional()
  })
});

export const collections = { blog, notes, projects, tools };

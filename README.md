# 小七的 AI 知识花园

小七的长期个人数字花园：构建阶段重度使用 AI，生产环境保持纯静态、免费、可长期运行。

## 技术栈

- Astro 6 + Content Layer
- TypeScript strict mode
- MDX / GFM / KaTeX / Shiki
- Tailwind CSS 3.4
- Pagefind 静态搜索
- RSS / Sitemap
- Python AI 内容处理流水线

## 本地运行

```powershell
npm install
npm run dev
```

构建：

```powershell
npm run build
npm run preview
```

## 内容目录

```text
src/content/blog      正式文章
src/content/notes     排障记录和短笔记
src/content/projects  项目档案
src/content/tools     工具箱
```

四个模块的定位：

- 博客：正式文章、长期观点、完整教程，适合公开传播和 RSS 订阅。
- 笔记：软件排障、命令片段、临时想法，优先保证以后能搜索到。
- 项目：个人作品、技术实验、长期构建记录，适合做作品集。
- 工具箱：常用软件、脚本、链接、迁移位置和工作流入口。

快速创建内容：

```powershell
npm run new:blog -- "为什么我要做个人知识库"
npm run new:note -- "Cherry Studio 启动问题排查"
npm run new:project -- "AI 驱动博客系统"
npm run new:tool -- "Bandizip 迁移记录"
```

网页创作台：

```powershell
npm run dev:studio
```

然后打开：

```text
http://127.0.0.1:4321/studio
```

创作台可以在网页里快速添加博客、笔记、项目和工具箱条目。本地写入服务运行时会直接保存到 `src/content/**`；如果没有启动写入服务，页面仍然可以下载或复制 MDX 文件。部署到 Vercel/Cloudflare Pages 后仍保持纯静态，不需要数据库和长期后端费用。

可选参数：

```powershell
npm run new:note -- "Windows 常用命令" "tags=Windows,命令行" draft=true
npm run new:project -- "个人工具站" slug=personal-tool-site
```

每篇文章使用 MDX frontmatter：

```yaml
---
title: "文章标题"
description: "SEO 描述"
date: 2026-06-06
tags: ["Astro", "AI"]
category: "元信息"
draft: false
featured: false
summary: "摘要"
language: "zh"
---
```

## AI 内容处理

安装 Python 依赖：

```powershell
python -m pip install -r requirements-ai.txt
```

复制配置：

```powershell
Copy-Item .env.example .env
```

填写：

```text
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-...
LLM_MODEL=gpt-5.2
```

把草稿放到 `drafts/`，然后运行：

```powershell
npm run ai:process
```

不调用 AI 的本地整理模式：

```powershell
python scripts/ai-processor.py --no-ai
```

AI pipeline 会做：

- 结构化审稿，不输出隐藏推理链
- SEO 标题、描述、标签、分类
- JSON-LD 生成
- 中英日多语言草稿
- Python / Go 代码块基础验证
- 静态 SVG OG 封面生成

## Cloudflare Pages 部署

1. 把项目推送到 GitHub。
2. Cloudflare Dashboard -> Workers & Pages -> Create application -> Pages。
3. 选择 GitHub 仓库。
4. 构建设置：

```text
Build command: npm run build
Build output directory: dist
Node version: 22
```

5. Custom domains 里添加你的域名。
6. 按 Cloudflare 提示把 DNS 记录指向 Pages。

## Vercel 部署

1. Import GitHub Repository。
2. Framework Preset 选择 Astro。
3. Build Command 使用：

```text
npm run build
```

4. Output Directory：

```text
dist
```

5. Settings -> Domains 绑定你的域名。

## GitHub Actions

项目内置 `.github/workflows/build.yml`，每次推送 `src/**` 或配置文件时自动构建。

如果你希望 push 草稿后自动跑 AI pipeline，可以在 GitHub Secrets 添加：

```text
LLM_API_KEY
LLM_BASE_URL
LLM_MODEL
```

然后在 workflow 里增加：

```yaml
- run: python -m pip install -r requirements-ai.txt
- run: python scripts/ai-processor.py
  env:
    LLM_API_KEY: ${{ secrets.LLM_API_KEY }}
    LLM_BASE_URL: ${{ secrets.LLM_BASE_URL }}
    LLM_MODEL: ${{ secrets.LLM_MODEL }}
```

建议默认不要在公开 CI 自动烧 API 额度，先在本地处理内容，再提交生成后的 MDX。

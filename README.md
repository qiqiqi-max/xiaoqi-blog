# 小七的博客

这里是小七的个人博客源码，也是一个用来记录折腾过程、工具经验、排障笔记和数字花园建设的静态站点。

- 线上地址：[https://277.bbroot.com](https://277.bbroot.com)
- GitHub 仓库：[qiqiqi-max/xiaoqi-blog](https://github.com/qiqiqi-max/xiaoqi-blog)
- 部署平台：Cloudflare Pages

## 项目简介

这个项目不是官方模板的演示站，而是按我的日常使用习惯整理出来的个人博客。它主要承担三件事：写长文、记随手笔记、沉淀自己常用的工具和问题处理经验。

站点内容目前围绕这些方向：

- Windows 软件迁移、系统排障和日常折腾记录
- AI 工具、效率工具和个人工作流整理
- 个人数字花园建设记录
- 随手记，用来保存短笔记、小想法和临时记录
- 工具箱，用来集中放一些自己常用的小工具入口
- 追番和番组记录，作为个人兴趣内容展示

## 主要功能

- **文章系统**：支持 Markdown / MDX、分类、标签、归档、RSS 和站点地图。
- **随手记**：独立的短笔记入口，适合记录零散想法和排障片段。
- **工具箱**：导航栏中有独立入口，后续可以继续加入 JSON、Base64、二维码、时间戳等在线工具。
- **动态壁纸**：首页支持 5 张 Kuroha 动图轮播壁纸，桌面端和手机端分别适配。
- **音乐播放器**：支持本地音乐播放，播放器已经加入导航弹窗和左侧边栏。
- **搜索**：使用 Pagefind 生成静态全文搜索，不依赖后端服务。
- **追番 / 番组**：保留个人追番与 Bangumi 展示页面。
- **主题体验**：支持亮色、暗色、跟随系统、主题色切换和响应式布局。
- **Cloudflare 部署**：推送到 GitHub 后，由 Cloudflare Pages 自动构建上线。

## 技术栈

- **框架**：Astro 7
- **语言**：TypeScript
- **样式**：Tailwind CSS 4
- **内容**：Markdown / MDX / Astro Content Collections
- **交互**：Svelte Islands、Swup、原生浏览器 API
- **搜索**：Pagefind
- **图标**：Iconify / Astro Icon
- **部署**：Cloudflare Pages
- **包管理**：pnpm

## 项目结构

```text
src/
  components/          页面组件、侧边栏组件、播放器组件等
  config/              站点、导航栏、侧边栏、音乐、壁纸等配置
  content/
    posts/             正式博客文章
    notes/             随手记
    spec/              about、guestbook 等特殊页面内容
  layouts/             页面布局
  pages/               路由页面，包括 tools、notes、archive 等
public/
  assets/
    music/             本地音乐文件
    wallpapers/        桌面端和手机端壁纸
  data/
    music-playlist.json 本地音乐歌单
scripts/               构建辅助脚本
```

## 本地运行

安装依赖：

```bash
pnpm install
```

启动开发服务器：

```bash
pnpm run dev
```

构建静态站点：

```bash
pnpm run build
```

本地预览构建结果：

```bash
pnpm run preview
```

## 常用命令

```bash
# 新建博客文章
pnpm run new-post -- "文章标题"

# Astro 检查
pnpm run check

# 格式化源码
pnpm run format

# 代码检查
pnpm run lint

# 生成图标常量
pnpm run icons

# 生成图片 LQIP 缓存
pnpm run lqips
```

## 写文章

正式文章放在：

```text
src/content/posts/
```

随手记放在：

```text
src/content/notes/
```

文章基础 frontmatter 示例：

```yaml
---
title: 文章标题
published: 2026-07-09
description: 简短描述
image: ''
tags: [工具箱, Windows]
category: 工具箱
draft: false
lang: zh_CN
---
```

随手记基础 frontmatter 示例：

```yaml
---
title: 一条随手记
published: 2026-07-09
description: 简短摘要
tags: [记录]
draft: false
---
```

## 自定义壁纸

壁纸配置在：

```text
src/config/backgroundWallpaper.ts
```

壁纸文件放在：

```text
public/assets/wallpapers/
public/assets/wallpapers/mobile/
```

当前站点使用桌面端和手机端两套动图资源，并开启轮播。替换同名文件或修改配置里的图片列表即可更新壁纸。

## 自定义音乐

音乐文件放在：

```text
public/assets/music/
```

歌单配置在：

```text
public/data/music-playlist.json
```

示例：

```json
{
  "playlist": [
    {
      "name": "夜、萤火虫和你",
      "artist": "AniFace",
      "url": "/assets/music/aniface-night-fireflies-and-you.mp3"
    }
  ]
}
```

## 部署

当前项目通过 GitHub 仓库连接 Cloudflare Pages 部署。推送到 `main` 分支后，Cloudflare Pages 会自动构建并发布。

Cloudflare Pages 构建配置：

```text
Build command: pnpm run build
Build output directory: dist
Node.js version: 18 或更高
```

自定义域名：

```text
277.bbroot.com
```

## 说明

这是一个个人博客项目，站点内容、图片、音乐和文字记录主要用于个人展示与备份。代码部分可作为 Astro 静态博客搭建参考，内容版权归小七所有。
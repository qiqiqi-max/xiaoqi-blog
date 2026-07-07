# 小七的博客

这是小七的个人博客源码。

站点地址：https://277.bbroot.com

当前保留的内容主要是：

- 个人数字花园建设记录
- Windows 软件迁移和排障笔记
- AI 工具使用记录
- 个人工具箱

## 常用命令

```bash
pnpm install
pnpm run dev
pnpm run build
```

## 自定义壁纸和音乐

- 壁纸文件在 `public/assets/wallpapers/`，当前站点使用 `xiaoqi-desktop-*.png` 和 `xiaoqi-mobile-*.png`。直接替换同名文件即可换背景，也可以在 `src/config/backgroundWallpaper.ts` 里调整图片列表。
- 音乐文件放到 `public/assets/music/`，封面放到 `public/assets/music/covers/`，然后编辑 `public/data/music-playlist.json`：

```json
{
	"playlist": [
		{
			"name": "歌曲名",
			"artist": "歌手",
			"url": "/assets/music/song.mp3",
			"cover": "/assets/music/covers/song.webp",
			"lrc": ""
		}
	]
}
```

## 随手记

随手记放在 `src/content/notes/`，新建 `.md` 或 `.mdx` 文件即可。基础 frontmatter：

```md
---
title: 一条小笔记
published: 2026-07-07
description: 简短摘要
tags: [记录]
---

正文内容
```

部署目标为 Cloudflare Pages。

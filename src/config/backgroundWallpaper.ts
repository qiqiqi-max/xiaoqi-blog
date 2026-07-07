import type { BackgroundWallpaperConfig } from "@/types/backgroundWallpaper";

export const backgroundWallpaper: BackgroundWallpaperConfig = {
	mode: "none",
	switchable: false,
	playerEnable: false,
	src: "",
	common: {
		dimOpacity: 0.2,
		playerMode: "order",
		homeText: {
			enable: true,
			switchable: false,
			title: "小七的博客",
			titleSize: "3rem",
			subtitle: "记录折腾、工具、排障和数字花园。",
			subtitleSize: "1.5rem",
			typewriter: {
				enable: false,
				speed: 100,
				deleteSpeed: 50,
				pauseTime: 2000,
			},
		},
		navbar: {
			transparentMode: "semi",
			enableBlur: true,
			blur: 5,
		},
		waves: {
			enable: {
				desktop: false,
				mobile: false,
			},
			switchable: false,
		},
		gradient: {
			enable: {
				desktop: false,
				mobile: false,
			},
			height: "10%",
			switchable: false,
		},
		carousel: {
			enable: false,
			interval: 5000,
			transitionEffect: "zoom",
			switchable: false,
		},
	},
	banner: {
		position: "center",
	},
	overlay: {
		switchable: {
			opacity: true,
			blur: true,
			cardOpacity: true,
		},
		zIndex: -1,
		opacity: 0.8,
		blur: 10,
		cardOpacity: 0.5,
	},
	fullscreen: {
		position: "center",
	},
};

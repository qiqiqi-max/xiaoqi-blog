import type { BackgroundWallpaperConfig } from "@/types/backgroundWallpaper";

export const backgroundWallpaper: BackgroundWallpaperConfig = {
	mode: "banner",
	switchable: true,
	playerEnable: false,
	src: {
		desktop: [
			"/assets/wallpapers/xiaoqi-desktop-1.png",
			"/assets/wallpapers/xiaoqi-desktop-2.png",
			"/assets/wallpapers/xiaoqi-desktop-3.png",
		],
		mobile: [
			"/assets/wallpapers/xiaoqi-mobile-1.png",
			"/assets/wallpapers/xiaoqi-mobile-2.png",
			"/assets/wallpapers/xiaoqi-mobile-3.png",
		],
	},
	common: {
		dimOpacity: 0.28,
		playerMode: "order",
		homeText: {
			enable: true,
			switchable: true,
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
			transparentMode: "semifull",
			enableBlur: true,
			blur: 5,
		},
		waves: {
			enable: {
				desktop: false,
				mobile: false,
			},
			switchable: true,
		},
		gradient: {
			enable: {
				desktop: true,
				mobile: true,
			},
			height: "24vh",
			switchable: true,
		},
		carousel: {
			enable: true,
			interval: 7000,
			transitionEffect: "fade",
			switchable: true,
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

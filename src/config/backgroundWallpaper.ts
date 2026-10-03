import type { BackgroundWallpaperConfig } from "@/types/backgroundWallpaper";

export const backgroundWallpaper: BackgroundWallpaperConfig = {
	mode: "banner",
	switchable: true,
	playerEnable: false,
	src: {
		desktop: [
			"/assets/wallpapers/kuroha-01-first-snow.mp4",
			"/assets/wallpapers/kuroha-02-yuyu-v2.mp4",
			"/assets/wallpapers/kuroha-03-moment.mp4",
			"/assets/wallpapers/kuroha-04-moment-person-1.mp4",
			"/assets/wallpapers/kuroha-05-moment-person-3.mp4",
		],
		mobile: [
			"/assets/wallpapers/mobile/kuroha-04-moment-person-1-mobile-v3.mp4",
			"/assets/wallpapers/mobile/kuroha-05-moment-person-3-mobile-v3.mp4",
			"/assets/wallpapers/mobile/kuroha-03-moment-mobile-v3.mp4",
			"/assets/wallpapers/mobile/kuroha-02-yuyu-v2-mobile-v3.mp4",
			"/assets/wallpapers/mobile/kuroha-01-first-snow-mobile-v3.mp4",
		],
	},
	common: {
		dimOpacity: 0.38,
		playerMode: "order",
		homeText: {
			enable: true,
			switchable: true,
			title: "Qi 的博客",
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

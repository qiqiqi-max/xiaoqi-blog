import type { MusicPlayerConfig } from "../types/musicConfig";

export const musicPlayerConfig: MusicPlayerConfig = {
	showInNavbar: true,
	mode: "local",
	playlistUrl: "/data/music-playlist.json",
	volume: 0.7,
	playMode: "list",
	showLyrics: true,
	meting: {},
	local: {
		playlist: [],
	},
};

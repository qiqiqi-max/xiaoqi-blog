export type LocalMusicTrack = {
	name: string;
	artist: string;
	url: string;
	cover?: string;
	lrc?: string;
};

export type MusicPlayerConfig = {
	// "meting" uses a third-party music API; "local" uses your own playlist.
	mode?: "meting" | "local";

	// Optional JSON playlist URL. In local mode this is loaded first, then
	// local.playlist is used as a fallback.
	playlistUrl?: string;

	// Default volume (0-1).
	volume?: number;

	// Playback mode: "list" = loop playlist, "one" = repeat one, "random" = shuffle.
	playMode?: "list" | "one" | "random";

	showLyrics?: boolean;

	showInNavbar?: boolean;

	meting?: {
		api?: string;
		server?: "netease" | "tencent" | "kugou" | "xiami" | "baidu";
		type?: "song" | "playlist" | "album" | "search" | "artist";
		id?: string;
		auth?: string;
		fallbackApis?: string[];
	};

	local?: {
		playlist?: LocalMusicTrack[];
	};
};

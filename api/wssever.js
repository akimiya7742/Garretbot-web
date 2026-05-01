const { useHooks } = require("zihooks");
const { getManager, Player } = require("ziplayer");
const jwt = require("jsonwebtoken");

module.exports.data = {
	name: "wssever",
	description: "WebSocket server with Auth",
	version: "1.1.0",
	enable: true,
	priority: 9,
};

module.exports.execute = (client) => {
	const wss = useHooks.get("wss");
	if (!wss) return;

	wss.on("connection", (ws) => {
		logger.debug("[WebSocket] Client connected.");

		let user = null;
		let player = null;
		let authenticated = false;

		const sendStatistics = async () => {
			if (!player?.connection || !authenticated) return;
			try {
				const queueTracks = player.queue.tracks.map((track) => ({
					title: track.title,
					url: track.url,
					duration: track.duration,
					thumbnail: track.thumbnail,
					author: track?.metadata?.author,
				}));

				const currentTrack =
					player.currentTrack ?
						{
							title: player.currentTrack.title,
							url: player.currentTrack.url,
							duration: player.currentTrack.duration,
							thumbnail: player.currentTrack.thumbnail,
							author: player.currentTrack?.metadata?.author,
						}
					:	null;

				ws.send(
					JSON.stringify({
						event: "statistics",
						timestamp: player.getTime(),
						listeners: player.userdata?.channel?.members.filter((mem) => !mem.user.bot).size ?? 0,
						tracks: player.queue.tracks?.length,
						volume: player.volume,
						paused: player.isPaused,
						repeatMode: player.loop(),
						track: currentTrack,
						queue: queueTracks,
						filters: null,
						shuffle: null,
					}),
				);
			} catch (error) {
				logger.error("Error in statistics handler:", error);
			}
		};

		let statsInterval = null;

		ws.on("message", async (message) => {
			try {
				const data = JSON.parse(message);
				
				if (data.event === "identify") {
					try {
						const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
						user = await client.users.fetch(decoded.id);
						authenticated = true;
						ws.send(JSON.stringify({ event: "authenticated", user: { id: user.id, username: user.username } }));
						
						// After auth, try to get existing voice connection if any
						const manager = getManager();
						const userData = manager.getall().find((node) => node?.userdata?.listeners?.some(l => l.id === user.id));
						if (userData?.connection) {
							player = userData;
							ws.send(JSON.stringify({ 
								event: "ReplyVoice", 
								channel: { id: userData.userdata.channel.id, name: userData.userdata.channel.name }, 
								guild: { id: player.userdata.channel.guild.id, name: player.userdata.channel.guild.name } 
							}));
							if (!statsInterval) statsInterval = setInterval(sendStatistics, 1000);
						}
					} catch (err) {
						ws.send(JSON.stringify({ event: "error", message: "Invalid token" }));
					}
					return;
				}

				if (!authenticated) {
					ws.send(JSON.stringify({ event: "error", message: "Not authenticated" }));
					return;
				}

				if (data.event == "GetVoice") {
					const manager = getManager();
					const userData = manager.getall().find((node) => node?.userdata?.listeners?.some(l => l.id === user.id));

					if (userData?.connection) {
						player = userData;
						ws.send(
							JSON.stringify({ 
								event: "ReplyVoice", 
								channel: { id: userData.userdata.channel.id, name: userData.userdata.channel.name }, 
								guild: { id: player.userdata.channel.guild.id, name: player.userdata.channel.guild.name } 
							}),
						);
						if (!statsInterval) statsInterval = setInterval(sendStatistics, 1000);
					} else {
						ws.send(JSON.stringify({ event: "error", message: "No active voice connection found for user" }));
					}
				}

				if (!player) return;
				if (player.userdata.LockStatus && player.userdata.requestedBy?.id !== user.id) return;

				switch (data.event) {
					case "pause":
						if (player.isPaused) player.resume(); else player.pause();
						break;
					case "play":
						await player.play(data.trackUrl);
						break;
					case "skip":
						player.skip();
						break;
					case "back":
						if (player.previousTrack) player.previous();
						break;
					case "volume":
						await player.setVolume(Number(data.volume));
						break;
					case "loop":
						player.loop(["off", "track", "queue"][Number(data.mode)]);
						break;
					case "shuffle":
						await player.shuffle();
						break;
					case "Playnext":
						if (player.queue.isEmpty || !data.trackUrl || !data.TrackPosition) break;
						const res = await player.search(data.trackUrl, user);
						if (res) {
							await player.remove(data.TrackPosition - 1);
							await player.insert(res.tracks?.at(0), 0);
							await player.skip();
						}
						break;
					case "DelTrack":
						if (player.queue.isEmpty || !data.TrackPosition) break;
						player.remove(data.TrackPosition - 1);
						break;
					case "seek":
						await player.seek(data.position);
						break;
				}
			} catch (error) {
				logger.error("WebSocket message error:", error);
			}
		});

		ws.on("close", () => {
			logger.debug("[WebSocket] Client disconnected.");
			if (statsInterval) clearInterval(statsInterval);
		});
	});
};

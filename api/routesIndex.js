const express = require("express");
const router = express.Router();
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { useHooks } = require("zihooks");
const config = useHooks.get("config");
const REDIRECT_URI = `${process.env.API_URL}/auth/discord/callback`;

module.exports.data = {
	name: "APIRoutes",
	description: "Bot web control",
	version: "2.0.0",
	enable: true,
	priority: 9,
};

module.exports.execute = (client) => {
	const server = useHooks.get("server");
	console.log(client);

	router.get("/auth/discord/login", async (req, res) => {
		try {
			const url = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds%20email`;
			res.redirect(url);
		} catch (error) {
			console.error("[Bot API] Error fetching user guilds:", error);
			return res.status(500).json({
				success: false,
				error: error.message,
			});
		}
	});

	router.get("/auth/discord/callback", async (req, res) => {
		const { code } = req.query;
		if (!code) return res.status(400).send("No code provided");

		try {
			const tokenResponse = await axios.post(
				"https://discord.com/api/oauth2/token",
				new URLSearchParams({
					client_id: client.user.id,
					client_secret: process.env.DISCORD_CLIENT_SECRET,
					grant_type: "authorization_code",
					code: code.toString(),
					redirect_uri: REDIRECT_URI,
				}),
				{ headers: { "Content-Type": "application/x-www-form-urlencoded" } },
			);

			const { access_token } = tokenResponse.data;

			const userResponse = await axios.get("https://discord.com/api/users/@me", {
				headers: { Authorization: `Bearer ${access_token}` },
			});

			const userData = userResponse.data;

			// In a real app, you'd find/create the user in MongoDB here
			// const user = await ZiUser.findOneAndUpdate({ userID: userData.id }, { ... }, { upsert: true });

			const token = jwt.sign(
				{ id: userData.id, username: userData.username, avatar: userData.avatar }, //aaaaa
				process.env.JWT_SECRET,
				{
					expiresIn: "7d",
				},
			);

			// Redirect back to frontend with token
			// Using HashRouter so token is passed as query param which frontend will pick up
			res.redirect(`${process.env.DASHBOARD_URL}/#/login-success?token=${token}`);
		} catch (error) {
			console.error("Auth error:", error.response?.data || error.message);
			res.status(500).send("Authentication failed");
		}
	});

	router.get("/user/me", async (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader) return res.status(401).send("No token provided");

		const token = authHeader.split(" ")[1];
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			const user = await ZiUser.findOne({ userID: decoded.id });

			res.json({
				id: decoded.id,
				username: decoded.username,
				avatar: decoded.avatar,
				// Mock DB data for preview
				level: user?.level || 1,
				coin: user?.coin || 0,
				xp: user?.xp || 0,
			});
		} catch (error) {
			res.status(401).send("Invalid token");
		}
	});
	server.use("/", router);
};

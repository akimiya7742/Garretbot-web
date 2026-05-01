import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1005716197259612193";
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "USEg2BG8yDlzdnW9cFxieq9bcnTE5_UI";
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || "http://localhost:3000/api/auth/discord/callback";
const JWT_SECRET = process.env.JWT_SECRET || "ziji-secret-key-change-me";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/auth/discord/login", (req, res) => {
    const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds%20email`;
    res.redirect(url);
  });

  app.get("/api/auth/discord/callback", async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send("No code provided");

    try {
      const tokenResponse = await axios.post(
        "https://discord.com/api/oauth2/token",
        new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: "authorization_code",
          code: code.toString(),
          redirect_uri: REDIRECT_URI,
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const { access_token } = tokenResponse.data;

      const userResponse = await axios.get("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const userData = userResponse.data;

      // In a real app, you'd find/create the user in MongoDB here
      // const user = await ZiUser.findOneAndUpdate({ userID: userData.id }, { ... }, { upsert: true });

      const token = jwt.sign(
        { id: userData.id, username: userData.username, avatar: userData.avatar },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Redirect back to frontend with token
      // Using HashRouter so token is passed as query param which frontend will pick up
      res.redirect(`/#/login-success?token=${token}`);
    } catch (error: any) {
      console.error("Auth error:", error.response?.data || error.message);
      res.status(500).send("Authentication failed");
    }
  });

  app.get("/api/user/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send("No token provided");

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // In a real app, fetch from DB
      // const user = await ZiUser.findOne({ userID: decoded.id });
      
      res.json({
        id: decoded.id,
        username: decoded.username,
        avatar: decoded.avatar,
        // Mock DB data for preview
        level: 42,
        coin: 1337,
        xp: 9000
      });
    } catch (error) {
      res.status(401).send("Invalid token");
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: Serve static files and handle SPA routing
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

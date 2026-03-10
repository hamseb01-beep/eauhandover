import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

const GAS_URL = "https://script.google.com/macros/s/AKfycbwy1onJAKESlRdRZUb-xiPC-D-jTvpQtJmehpAOMRVtecNCWXyyzYCjAewhwCeY_CZY/exec";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy GET requests to Google Sheets
  app.get("/api/shifts", async (req, res) => {
    try {
      const response = await fetch(`${GAS_URL}?method=GET`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      res.status(500).json({ error: "Failed to fetch shifts from Google Sheets" });
    }
  });

  // Proxy POST requests to Google Sheets
  app.post("/api/shifts", async (req, res) => {
    try {
      const response = await fetch(GAS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error saving shift:", error);
      res.status(500).json({ error: "Failed to save shift to Google Sheets" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

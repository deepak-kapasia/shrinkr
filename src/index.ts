import "dotenv/config";

import express from "express";
import helmet from "helmet";
import path from "node:path";
import { pool } from "./db/pool";
import { config } from "./config";
import linkRoutes from "./routes/linkRoutes";

const app = express();
const publicDirectory = path.join(__dirname, "../public");

app.disable("x-powered-by");
app.set("trust proxy", config.trustProxy);
app.use(
  helmet({
    // HTTPS-only browser policies belong in production; local development uses HTTP.
    contentSecurityPolicy: config.nodeEnv === "production",
    hsts: config.nodeEnv === "production",
  }),
);
app.use(express.json({ limit: "10kb" }));
app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});
app.use(express.static(publicDirectory));
app.use(linkRoutes);

app.use((request, response) => {
  response.status(404).json({ error: `Route not found: ${request.method} ${request.path}` });
});

app.use((
  error: Error & { status?: number; type?: string },
  _request: express.Request,
  response: express.Response,
  _next: express.NextFunction,
) => {
  console.error(error);

  if (error.type === "entity.parse.failed") {
    response.status(400).json({ error: "Request body must be valid JSON." });
    return;
  }

  response.status(error.status ?? 500).json({
    error: error.status ? error.message : "Internal server error.",
  });
});

if (require.main === module) {
  const server = app.listen(config.port, () => {
    console.log(`URL shortener listening at ${config.baseUrl}`);
  });

  const shutdown = (signal: string): void => {
    console.log(`${signal} received. Shutting down gracefully...`);

    server.close(() => {
      void pool.end().then(() => {
        console.log("Database connections closed.");
        process.exit(0);
      });
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

export default app;

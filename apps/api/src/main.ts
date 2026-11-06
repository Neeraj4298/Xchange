import { createApiServer } from "./app";
import { loadAppConfig, logger } from "./config/env.config";

const config = loadAppConfig();
const server = createApiServer();

server.listen(config.port, config.host, () => {
  logger.info(`Xchange Modular Monolith API listening on http://${config.host}:${config.port}`, {
    phase: "v2.0",
    port: config.port,
  });
});

function gracefulShutdown(signal: string): void {
  logger.info(`Received ${signal}, shutting down Xchange API gracefully...`);
  server.close(() => {
    logger.info("HTTP server closed cleanly.");
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 3000).unref();
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));


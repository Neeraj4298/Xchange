import { createApiServer } from "./app";
import { loadAppConfig, logger } from "./config/env.config";

const config = loadAppConfig();
const server = createApiServer();

server.listen(config.port, config.host, () => {
  logger.info(`Xchange Modular Monolith API listening on http://${config.host}:${config.port}`, {
    phase: "v0.0",
    port: config.port,
  });
});

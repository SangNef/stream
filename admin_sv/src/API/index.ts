import "./pre-start"; // Must be the first import
import logger from "jet-logger";

import config from "~/config";
import server from "./server";

// **** Run **** //

const SERVER_START_MSG = "Express server started on port: " + config.Port.toString();

server().then((server) => server.listen(config.Port, () => logger.info(SERVER_START_MSG)));

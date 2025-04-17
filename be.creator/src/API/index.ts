import "./pre-start"; // Must be the first import
import logger from "jet-logger";

import http from "http";
import config from "../config";
import appMain from "./server";
import WebSocket_Server from "../websocket/websocket";
import nms from "./helpers/nms";

// **** Run **** //

const SERVER_START_MSG = "Express server started on port: " + config.Port.toString();
appMain().then((app) => {
    const server = http.createServer(app);
    WebSocket_Server(server);
    nms.run();

    server.listen(config.Port, () => {
        logger.info(SERVER_START_MSG);
    });
});
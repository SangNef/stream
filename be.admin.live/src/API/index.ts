import "./pre-start"; // Must be the first import
import logger from "jet-logger";

import http from "http";
import appMain from "./server";
import WebSocket_Server from "../websocket/websocket";
import config from "../config";

// **** Run **** //
// const SERVER_START_MSG = "Express server started on port: " + config.Port.toString();
const SERVER_START_MSG = "Express server started on port: " + 5200;
appMain().then((app) => {
    const server = http.createServer(app);
    WebSocket_Server(server);

    // server.listen(config.Port, () => {
    server.listen(5200, () => {
        logger.info(SERVER_START_MSG);
    });
});
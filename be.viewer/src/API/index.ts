import "./pre-start"; // Must be the first import
import logger from "jet-logger";

import http from "http";
import config from "../config";
import appMain from "./server";
import { WebSocketServer } from "ws";
import WS_RedisEvents from "~/websocket/redisEvents";
import { handleWSConnection } from "~/websocket/wsHandler";

// **** Run **** //

const SERVER_START_MSG = "Express server & WebSocket started on port: " + config.Port.toString();

appMain().then((app) => {
    const server = http.createServer(app);
    const wss = new WebSocketServer({ server });
    
    WS_RedisEvents();
    wss.on('connection', async (ws, req) => handleWSConnection(ws, req));
    server.listen(config.Port, () => {
        logger.info(SERVER_START_MSG);
    });
});

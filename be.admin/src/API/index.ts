import "./pre-start"; 
import logger from "jet-logger";
import config from "~/config";
import server from "./server";
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { handleWSConnection } from "~/websocket/wsHandler";
import 'module-alias/register';
import "~/type/app.entities";

server().then((app) => {
    const httpServer = createServer(app);
    const wss = new WebSocketServer({ server: httpServer });

    wss.on('connection', async (ws, req) => handleWSConnection(ws, req));

    httpServer.listen(config.Port || 5200, () => logger.info(`Server & WS running on port: ${config.Port || 5200}`));
});
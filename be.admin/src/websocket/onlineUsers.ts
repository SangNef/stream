import { WebSocket } from "ws";
import { OnlineUser } from "./wsTypes";

export const onlineUsers: Map<number, OnlineUser & { ws: WebSocket }> = new Map();

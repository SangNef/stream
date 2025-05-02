import { WebSocket } from "ws";
import { ViewStream } from "./wsTypes";

export const viewStream: Map<string, ViewStream & { ws: WebSocket }> = new Map();
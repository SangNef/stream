import { WebSocket } from "ws";
import { WSMessage } from "./wsTypes";
import fs from "fs";
import path from "path";
import { findKeyInMap, getStreamKeyInConnection, saveNewConnectToWebSocket } from "./wsService";
import { SET_OFFLINE } from "./handlers/user";
import WS_FfmpegHandler from "./ffmpegHandler";
import { Stream, User } from "~/models";
import { mapLivestreams } from "./livestreams";
import redisClient from "~/API/helpers/redis";
import { StreamStatus } from "~/type/app.entities";
import { viewStream } from "./viewStream";

const handlers: Record<string, (ws: WebSocket, data: WSMessage, info: User) => Promise<void>> = {};

// Tự động import tất cả handlers trong thư mục 'handlers'
const handlersDir = path.join(__dirname, "handlers");
fs.readdirSync(handlersDir).forEach((file) => {
    if (file.endsWith(".ts") || file.endsWith(".js")) {
        const module = require(path.join(handlersDir, file));
        Object.keys(module).forEach(key => {
            handlers[key] = module[key];
        });
    }
});

console.log("Loaded WebSocket handlers:", Object.keys(handlers));

export const handleWSConnection = async (ws: WebSocket, req: any) => {
    // Kiểm tra token kèm theo từ phía client khi gửi yêu cầu kết nối.
    const newConnect = await saveNewConnectToWebSocket(ws as any, req);
    if(!newConnect){
        console.log('[WebSocket]: Tự động ngắt kết nối do token không hợp lệ!');
        return ws.close();
    }
    console.log(`User ${newConnect.id} connected to WebSocket`);

    // Phần xử lý stream.
    const streamKey = getStreamKeyInConnection(req);
    if(streamKey){
        WS_FfmpegHandler(streamKey, ws);
    } else {
        ws.on("message", async (message) => {
            try {
                const data: WSMessage = JSON.parse(message.toString());
                // console.log("Received:", data);
    
                // Gọi handler tương ứng
                if (handlers[data.type.toUpperCase()]) {
                    await handlers[data.type.toUpperCase()](ws, data, newConnect);
                } else {
                    ws.send(JSON.stringify({ type: "ERROR", message: "Kiểu thao tác không xác định!" }));
                }
            } catch (error) {
                console.error("Error processing message:", error);
                ws.send(JSON.stringify({ type: "ERROR", message: "Lỗi nội bộ máy chủ!" }));
            }
        });
    
        ws.on("close", async () => {
            const streamid = findKeyInMap(mapLivestreams, newConnect.id);

            const streamExisted = await redisClient.get(`${streamid}`);
            if(streamExisted){
                const views = await redisClient.get(`${streamid}`);
                const parseIntViews = views? parseInt(views): 0;
                await Stream.update({ view: parseIntViews, status: 'stop' as StreamStatus }, { where: { id: streamid }});
                await redisClient.del(`${streamid}`);
                await redisClient.del(`stream${streamid}`);
            }

            await redisClient.publish('end-stream', JSON.stringify({
                type: 'ended-stream',
                stream_id: streamid,
                user_id: newConnect.id,
                message: 'Phiên LIVE đã kết thúc!'
            }));
            const keysStreamId = Array.from(viewStream.keys());
            keysStreamId.map(streams => {
                if(streams.startsWith(streamid)){
                    viewStream.delete(streams);
                }
            });
            mapLivestreams.delete(streamid);

            console.log(`User ${newConnect.id} disconnected`);
            SET_OFFLINE(ws, newConnect.id, newConnect);
        });
    }
};
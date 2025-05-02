import { WebSocket } from "ws";
import { WSMessage } from "./wsTypes";
import fs from "fs";
import path from "path";
import { SET_OFFLINE } from "./handlers/user";
import { User } from "~/models";
import redisClient from "~/API/helpers/redis";
import { viewStream } from "./viewStream";
import { saveNewConnectToWebSocket } from "./wsService";
import { onlineUsers } from "./onlineUsers";

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
        const viewsCurrent = Array.from(viewStream.values());
        viewsCurrent.forEach(async (items: any) => {
            if(items?.id === newConnect.id && items?.stream_id){
                await redisClient.decr(`${items?.stream_id}`);
                viewStream.delete(`${items.stream_id}${newConnect.id}`);
                await redisClient.publish('out-stream', JSON.stringify({
                    type: 'outed-stream',
                    stream_id: items.stream_id,
                    user_id: newConnect.id,
                    message: `${newConnect.username} Outed Stream`
                }));
            }
        });
        onlineUsers.delete(newConnect.id);

        console.log(`User ${newConnect.id} disconnected`);
        SET_OFFLINE(ws, newConnect.id, newConnect);
    });
};
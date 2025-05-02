import { WebSocket } from "ws";
import { WSMessage } from "./wsTypes";
import fs from "fs";
import path from "path";
import { saveNewConnectToWebSocket } from "./wsService";
import { SET_OFFLINE } from "./handlers/user";

const handlers: Record<string, (ws: WebSocket, data: WSMessage) => Promise<void>> = {};

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
    console.log(`Admin ${newConnect.id} connected to WebSocket`);

    ws.on("message", async (message) => {
        try {
            const data: WSMessage = JSON.parse(message.toString());
            // console.log("Received:", data);

            // Gọi handler tương ứng
            if (handlers[data.type.toUpperCase()]) {
                await handlers[data.type.toUpperCase()](ws, data);
            } else {
                ws.send(JSON.stringify({ type: "ERROR", message: "Kiểu thao tác không xác định!" }));
            }
        } catch (error) {
            console.error("Error processing message:", error);
            ws.send(JSON.stringify({ type: "ERROR", message: "Lỗi nội bộ máy chủ!" }));
        }
    });

    ws.on("close", () => {
        console.log(`Admin ${newConnect.id} disconnected`);
        SET_OFFLINE(ws, newConnect.id);
    });
};

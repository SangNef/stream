import { WebSocket } from "ws";
import { User } from "~/models";
import { WSMessage } from "../wsTypes";
import { onlineUsers } from "../onlineUsers";

export const SET_ONLINE = async (ws: WebSocket, data: WSMessage, info: User) => {
    if (!info.id) return;

    // Thêm user vào danh sách online
    onlineUsers.set(info.id, { id: info.id, username: info.username, role: info.role, ws });

    // Gửi danh sách user cùng role
    const onlineList = Array.from(onlineUsers.values()).filter((u) => u.role === info.role);

    ws.send(
        JSON.stringify({
            type: "ONLINE_LIST",
            payload: {
                role: info.role,
                users: onlineList,
            },
        })
    );
};

export const SET_OFFLINE = async (ws: WebSocket, data: WSMessage | number, info: User) => {
    if (!info) return;

    onlineUsers.delete(info.id);
    ws.send(JSON.stringify({ type: "USER_OFFLINE", user_id: info.id }));
};
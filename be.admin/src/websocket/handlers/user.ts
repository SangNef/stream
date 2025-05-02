import { WebSocket } from "ws";
import { Admin } from "~/models";
import { WSMessage } from "../wsTypes";
import { onlineUsers } from "../onlineUsers";

export const SET_ONLINE = async (ws: WebSocket, data: WSMessage) => {
    if (!data.payload?.user_id) return;

    const user = await Admin.findOne({ where: { id: data.payload.user_id } });

    if (!user) {
        ws.send(JSON.stringify({ type: "ERROR", message: "User not found" }));
        return;
    }

    // Thêm user vào danh sách online
    onlineUsers.set(user.id, { id: user.id, username: user.name, role: user.role, ws });

    // Gửi danh sách user cùng role
    const onlineList = Array.from(onlineUsers.values()).filter((u) => u.role === user.role);

    ws.send(
        JSON.stringify({
            type: "ONLINE_LIST",
            payload: {
                role: user.role,
                users: onlineList,
            },
        })
    );
};

export const SET_OFFLINE = async (ws: WebSocket, data: WSMessage | number) => {
    const adminId = (typeof(data)==='number')? data: data.payload.userId;

    if (!adminId) return;

    onlineUsers.delete(adminId);
    ws.send(JSON.stringify({ type: "USER_OFFLINE", user_id: adminId }));
};
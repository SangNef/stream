import "dotenv/config";
import { WebSocket } from "ws";
import { jwtVerifyAccessToken } from "~/API/helpers/jwt";
import { arrViewer } from "./websocket";
import { AuthService } from "~/API/services";
import { WS_Stream_Entity } from "~/type/ws.entities";
import redisClient from "~/API/helpers/redis";

// Lưu thông tin người dùng từ token khi kết nối ws.
export const saveNewConnectToWebSocket = (websocket: WebSocket, req: any) => {
    const urlParams = new URLSearchParams(req.url?.split('?')[1]);
    const beaererToken = urlParams.get('token');
    if(!beaererToken){
        console.log('[WebSocket --- In onconnection]: Disconnected because token invalid!');
        websocket.close();
        return;
    }
    const payload = validateToken(beaererToken);
    if(!payload){
        websocket.close();
        return payload;
    }

    const profile = AuthService.getProfileBySub(parseInt(payload.sub!));
    return profile;
}

// Lấy stream_key khi kết nối đến ws.
export const getStreamKeyInConnection = (websocket: WebSocket, req: any) => {
    const param = new URLSearchParams(req.url?.split('?')[1]);
    const streamKey = param.get('stream_key');
    if(!streamKey){
        // console.log('[WebSocket --- Connection]:: Connect Fail');
        // websocket.close();
        return;
    }
    return streamKey;
}

const validateToken = (token: string) => {
    try {
        const verify = jwtVerifyAccessToken(token, process.env.JWT_SECRET_ACCESSTOKEN!);
        return verify;
    } catch (error) {
        console.log('[WebSocket --- In validateToken]: Disconnected because token invalid!', error);
        return null;
    }
}

export const checkDataInvalid = (data: Partial<WS_Stream_Entity>) => {
    const streamid = parseInt(data.stream_id as any);

    if(!data || Number.isNaN(streamid)){
        return false;
    }

    return true;
}

export const findKeyInMap = (variableMap: any, value: any) => {
    for(const[keys, values] of variableMap.entries()){
        if(values === value){
            return keys;
        }
    }
    return null;
}
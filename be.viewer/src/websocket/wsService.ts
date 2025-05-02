import { jwtVerifyAccessToken } from "~/API/helpers/jwt";
import { AuthService } from "~/API/services";
import { WS_Stream_Entity } from "~/type/ws.entities";

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
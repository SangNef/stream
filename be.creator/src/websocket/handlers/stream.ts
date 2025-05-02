import { WebSocket } from "ws";
import { WSMessage } from "../wsTypes";
import { sequelize, Stream, User } from "~/models";
import { mapLivestreams, SERVER_ID } from "../livestreams";
import { viewStream } from "../viewStream";
import redisClient from "~/API/helpers/redis";
import { createNotiLive } from "../models/notification";
import { findKeyInMap } from "../wsService";
import { StreamStatus } from "~/type/app.entities";

export const CREATE_STREAM = async (ws: WebSocket, data: WSMessage, info: User) => {
    if (!info.id) return;
    const dataReq = data.payload;

    if(!info.role || info.role!=='creator'){
        return ws.send(JSON.stringify({
            type: 'STREAM_ERROR',
            message: 'Tài khoản không đủ quyền thực hiện thao tác!'
        }));
    }
    mapLivestreams.set(dataReq.stream_id, info.id);
    viewStream.set(`${dataReq.stream_id}${info.id}`, {
        id: info.id,
        stream_id: dataReq.stream_id, 
        ws
    });
    console.log(`[WebSocket]: Creator ${info.id} Created Stream With ID: ${dataReq.stream_id}`);

    // Tất cả người dùng đang xem live.
    if(!await redisClient.get(`stream${dataReq.stream_id}`)){
        const allViewer = [{ id: info.id }];
        await redisClient.set(`stream${dataReq.stream_id}`, JSON.stringify(allViewer));
    }
    // Lượng view của một live.
    if(!await redisClient.get(`${dataReq.stream_id}`)){
        await redisClient.set(`${dataReq.stream_id}`, 0);
    } else {
        return ws.send(JSON.stringify({
            type: 'STREAM_ERROR',
            message: 'Stream đang được phát trực tiếp!'
        }));
    }
    // Lưu thông tin livestream.
    await redisClient.hSet(`viewers-stream-${dataReq.stream_id}`, info.id, SERVER_ID);
    await redisClient.publish('join-stream', JSON.stringify({
        stream_id: dataReq.stream_id,
        message: null
    }));

    // Gửi thông báo live đến người dùng theo dõi.
    const createNotiLive_transaction = await sequelize.transaction();
    try {
        if(!dataReq.noti_type || (dataReq.noti_type!=='live' && dataReq.noti_type!=='coin')){
            return ws.send(JSON.stringify({
                type: 'NOTI_ERROR',
                message: 'Kiểu thông báo không hợp lệ!'
            }))
        }

        // Xử lý thông báo kiểu live.
        if(dataReq.noti_type==='live'){
            // Nếu không nhận được nội dung cần để tạo thông báo sẽ sử dụng thông báo mặc định.
            const dataStream = {
                title: dataReq.title? dataReq.title: `${info.username} đã nhắc đến bạn`,
                content: dataReq.content? dataReq.content: `Livestream của ${info.fullname} đã bắt đầu. Hãy đến xem nhé!`
            }
            const allFollower = await createNotiLive(info.id, dataStream);
            console.log(allFollower)
            // Trường hợp không có tài khoản nào theo dõi.
            if(typeof(allFollower)==='string'){
                return ws.send(JSON.stringify({
                    type: 'SENT_NOTI',
                    payload: { message: allFollower }
                }))
            }

            // Trường hợp có tài khoản theo dõi.
            // Lấy danh sách tài khoản theo dõi và gửi thông báo đến từng tài khoản.
            if(Array.isArray(allFollower)){
                for(let i=0; i<allFollower.length; i++){
                    await redisClient.publish(`noti-stream`, JSON.stringify({
                        socketId: allFollower[i].user_id,
                        payload: {
                            type: 'noti-live',
                            noti_id: allFollower[i].noti_id,
                            title: dataStream.title,
                            content: dataStream.content
                        }
                    }));
                }
            }
        }
    } catch (error) {
        createNotiLive_transaction.rollback();
        console.log('[WebSocket - SendNotiLive]:: Error: ', error);
    }
}

export const END_STREAM = async (ws: WebSocket, data: WSMessage, info: User) => {
    if(!info.role || info.role!=='creator'){
        return ws.send(JSON.stringify({
            type: 'STREAM_ERROR',
            message: 'Tài khoản không đủ quyền thực hiện thao tác!'
        }));
    }

    const dataReq = data.payload;

    const streamExisted = await redisClient.get(`${dataReq.stream_id}`);
    if(streamExisted){
        const views = await redisClient.get(`${dataReq.stream_id}`);
        const parseIntViews = views? parseInt(views): 0;
        await Stream.update({ view: parseIntViews}, { where: { id: dataReq.stream_id }});
        await redisClient.del(`${dataReq.stream_id}`);
        await redisClient.del(`stream${dataReq.stream_id}`);
    } else {
        return ws.send(JSON.stringify({
            type: 'STREAM_ERROR',
            message: 'Stream hiện tại không được phát trực tiếp! Không thể dừng!'
        }));
    }

    await redisClient.publish('end-stream', JSON.stringify({
        type: 'ended-stream',
        stream_id: dataReq.stream_id,
        user_id: info.id,
        message: 'Phiên LIVE đã kết thúc!'
    }));
    const streamid = findKeyInMap(mapLivestreams, info.id);
    mapLivestreams.delete(streamid);
    await Stream.update({ status: 'stop' as StreamStatus }, { where: { id: dataReq.stream_id }});
}
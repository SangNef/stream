import { WebSocket } from "ws";
import { WSMessage } from "../wsTypes";
import { User } from "~/models";
import { UserStreamService } from "~/API/services";
import { mapLivestreams, SERVER_ID } from "../livestreams";
import { viewStream } from "../viewStream";
import redisClient from "~/API/helpers/redis";

export const VIEW_STREAM = async (ws: WebSocket, data: WSMessage, info: User) => {
    const dataReq = data.payload;

    const livestreams = await UserStreamService.getStreamsHot(1, 1000, true);
    livestreams.records.forEach(items => {
        mapLivestreams.set(items.id, items);
    });

    if(mapLivestreams.get(dataReq.stream_id)){
        if(viewStream.get(`${dataReq.stream_id}${info.id}`)){
            return ws.send(JSON.stringify({
                type: 'VIEW_STREAM_ERROR',
                message: 'Bạn đang xem livestream này!'
            }));
        }

        viewStream.set(`${dataReq.stream_id}${info.id}`, {
            id: info.id,
            stream_id: dataReq.stream_id,
            ws
        });

        const streamRedis = await redisClient.get(`stream${dataReq.stream_id}`);
        const allViewer: any[] = JSON.parse(streamRedis!);
        allViewer.push({
            id: info.id,
        });

        await redisClient.set(`stream${dataReq.stream_id}`, JSON.stringify(allViewer));
        await redisClient.hSet(`viewers-stream-${dataReq.stream_id}`, info.id, SERVER_ID);
        await redisClient.incr(`${dataReq.stream_id}`);
        await redisClient.publish('join-stream', JSON.stringify({
            type: 'viewed-stream',
            stream_id: dataReq.stream_id,
            user_id: info.id,
            message: `${info.username} Join Stream`
        }));
        const comments = await redisClient.lRange(`comment-stream-${dataReq.stream_id}`, 0, 19);
        const commentList = comments.map(items => JSON.parse(items));
        ws.send(JSON.stringify({ type: 'view-comment', commentList }));
    } else {
        ws.send(JSON.stringify({
            type: 'STREAM_ERROR',
            message: 'Livestream không tồn tại!'
        }));
    }
}

export const OUT_STREAM = async (ws: WebSocket, data: WSMessage, info: User) => {
    const dataReq = data.payload;

    if(mapLivestreams.get(dataReq.stream_id)){
        viewStream.delete(`${dataReq.stream_id}${info.id}`);
        await redisClient.decr(`${dataReq.stream_id}`);
        await redisClient.publish('out-stream', JSON.stringify({
            type: 'outed-stream',
            stream_id: dataReq.stream_id,
            user_id: info.id,
            message: `${info.username} Outed Stream`
        }));
    } else {
        ws.send(JSON.stringify({
            type: 'STREAM_ERROR',
            message: 'Livestream không tồn tại!'
        }));
    }
}
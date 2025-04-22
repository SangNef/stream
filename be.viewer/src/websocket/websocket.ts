import { WebSocket, WebSocketServer } from "ws";
import logger from "jet-logger";
import sequelize from "../config/database";
import { checkDataInvalid, saveNewConnectToWebSocket } from "./ws.service";
import { isReadNotiLive } from "./model_db/ws.model.notification";
import redisClient from "~/API/helpers/redis";
import config from "~/config";
import { UserStreamService, UserTransactionService } from "~/API/services";
import { DonateItemModel } from "~/models";
import { addNewDonate } from "./model_db/ws.model.donate";

export const arrViewer = new Map(); // Danh sách tài khoản tham gia một livestream.
export const arrStream = new Map(); // Danh sách livestream.
export const allClient = new Map(); // Danh sách người dùng đang online.
const SERVER_ID = 'ws-viewer';

export default async function WebSocket_Server (server: any) {
    const websocket = new WebSocketServer({ server });
    
    const sub = redisClient.duplicate();
    await sub.connect();
    await sub.subscribe('noti-stream', message => {
        const { socketId, payload } = JSON.parse(message);
        const wsViewer = allClient.get(socketId);
        if (wsViewer && wsViewer?.ws?.readyState === WebSocket.OPEN) {
            wsViewer.ws.send(JSON.stringify(payload));
        }
    });
    await sub.subscribe('join-stream', data => {
        const { type, stream_id, user_id, message } = JSON.parse(data);
        const viewers = Array.from(arrViewer.values()).filter(items => items?.stream_id === stream_id && items?.id !== user_id);
        viewers.forEach((items: any) => {
            if(items?.ws && items?.ws.readyState === WebSocket.OPEN){
                items.ws.send(JSON.stringify({ type, message }));
            }
        });
    });
    await sub.subscribe('out-stream', data => {
        const { type, stream_id, message } = JSON.parse(data);
        const viewers = Array.from(arrViewer.values()).filter(items => items?.stream_id === stream_id);
        viewers.forEach((items: any) => {
            if(items?.ws && items?.ws.readyState === WebSocket.OPEN){
                items.ws.send(JSON.stringify({ type, message }));
            }
        });
    });
    await sub.subscribe('end-stream', async data => {
        const { type, stream_id, message } = JSON.parse(data);
        const viewers = Array.from(arrViewer.values()).filter(items => items?.stream_id === stream_id);
        viewers.forEach((items: any) => {
            if(items?.ws && items?.ws.readyState === WebSocket.OPEN){
                items.ws.send(JSON.stringify({ type, message }));
            }
        });
        for (const [key, value] of arrViewer.entries()) {
            if (value?.stream_id === stream_id) {
              arrViewer.delete(key);
            }
        }
        await redisClient.del(`comment-stream-${stream_id}`);
    });
    await sub.subscribe('new-comment', data => {
        // const { type, user, comment_id, payload } = JSON.parse(data);
        const { type, stream_id, commentList } = JSON.parse(data);
        // console.log(type, commentList);
        const viewers = Array.from(arrViewer.values()).filter(items => items?.stream_id === stream_id);
        viewers.forEach((items: any) => {
            if(items?.ws && items?.ws.readyState === WebSocket.OPEN){
                // items.ws.send(JSON.stringify({ type, user, comment_id, content: payload?.content }));
                items.ws.send(JSON.stringify({ type, commentList }));
            }
        });
    });
    await sub.subscribe('delete-comment', data => {
        const { type, stream_id, commentList } = JSON.parse(data);
        const viewers = Array.from(arrViewer.values()).filter(items => items?.stream_id === stream_id);
        viewers.forEach((items: any) => {
            if(items?.ws && items?.ws.readyState === WebSocket.OPEN){
                items.ws.send(JSON.stringify({ type, commentList }));
            }
        });
    });
    await sub.subscribe('donate', data => {
        const { type, stream_id, value, content, user } = JSON.parse(data);
        const viewers = Array.from(arrViewer.values()).filter(items => items?.stream_id === stream_id);
        viewers.forEach((items: any) => {
            if(items?.ws && items?.ws.readyState === WebSocket.OPEN){
                items.ws.send(JSON.stringify({ type, value, content, user }));
            }
        });
    });

    logger.info(`WebSocket running on port: ${config.Port}`);

    websocket.on('connection', async (ws, req: any) => {
        const newConnect = await saveNewConnectToWebSocket(ws, req);
        // const streamKey = getStreamKeyInConnection(ws, req);
        if(!newConnect){
            console.log('[WebSocket]: Tự động ngắt kết nối do token không hợp lệ!');
            return ws.close();
        }
        // if(streamKey) console.log('[WebSocket --- Connected]:: New Connected With Stream Key: ', streamKey);
        allClient.set(newConnect.id, {
            id: newConnect.id,
            ws
        });
        console.log(`User ${newConnect.id} connected!`);

        ws.on('message', async (data) => {
            const dataReq = JSON.parse(data.toString());
            // === Áp dụng cho cả creator và user ===  //
            if(dataReq.type==='set-online'){
                ws.send(JSON.stringify({
                    type: 'online-user',
                    payload: { isOnline: true }
                }))
            }

            // === Áp dụng cho role user === //
            if(dataReq.type==='view-stream'){
                const livestreams = await UserStreamService.getStreamsHot(1, 1000, true);
                livestreams.records.forEach(items => {
                    arrStream.set(items.id, items);
                });

                if(arrStream.get(dataReq.stream_id)){
                    if(arrViewer.get(`${dataReq.stream_id}${newConnect.id}`)){
                        return ws.send(JSON.stringify({
                            type: 'view-stream-error',
                            message: 'You are watching this livestream!'
                        }));
                    }

                    arrViewer.set(`${dataReq.stream_id}${newConnect.id}`, {
                        id: newConnect.id,
                        stream_id: dataReq.stream_id,
                        ws
                    });

                    const streamRedis = await redisClient.get(`stream${dataReq.stream_id}`);
                    const allViewer: any[] = JSON.parse(streamRedis!);
                    allViewer.push({
                        id: newConnect.id,
                    });

                    await redisClient.set(`stream${dataReq.stream_id}`, JSON.stringify(allViewer));
                    await redisClient.hSet(`viewers-stream-${dataReq.stream_id}`, newConnect.id, SERVER_ID); // 
                    await redisClient.incr(`${dataReq.stream_id}`);
                    await redisClient.publish('join-stream', JSON.stringify({
                        type: 'viewed-stream',
                        stream_id: dataReq.stream_id,
                        user_id: newConnect.id,
                        message: `${newConnect.username} Join Stream`
                    }));
                    const comments = await redisClient.lRange(`comment-stream-${dataReq.stream_id}`, 0, 19);
                    const commentList = comments.map(items => JSON.parse(items));
                    ws.send(JSON.stringify({ type: 'view-comment', commentList }));
                } else {
                    ws.send(JSON.stringify({
                        type: 'stream-error',
                        message: 'Stream Not Existed!'
                    }));
                }
            }

            if(dataReq.type==='out-stream'){
                if(arrStream.get(dataReq.stream_id)){
                    arrViewer.delete(`${dataReq.stream_id}${newConnect.id}`);
                    await redisClient.decr(`${dataReq.stream_id}`);
                    await redisClient.publish('out-stream', JSON.stringify({
                        type: 'outed-stream',
                        stream_id: dataReq.stream_id,
                        user_id: newConnect.id,
                        message: `${newConnect.username} Outed Stream`
                    }));
                } else {
                    ws.send(JSON.stringify({
                        type: 'stream-error',
                        message: 'Stream Not Existed!'
                    }));
                }
            }

            if(dataReq.type === 'view-more-comment'){
                const limit = parseInt(dataReq?.limit);
                const comments = await redisClient.lRange(`comment-stream-${dataReq.stream_id}`, 0, limit);
                const commentList = comments.map(items => JSON.parse(items));
                ws.send(JSON.stringify({ type: 'view-comment', commentList }));
            }

            if(dataReq.type==='send-comment'){
                try {
                    const isInvalid = checkDataInvalid(dataReq);
                    if(!isInvalid){
                        return ws.send(JSON.stringify({
                            type: 'comment-error',
                            message: 'DataInput Invalid!'
                        }));
                    }

                    const isJoinedStream = arrViewer.get(`${dataReq.stream_id}${newConnect.id}`);
                    if(!isJoinedStream){
                        return ws.send(JSON.stringify({
                            type: 'comment-error',
                            message: 'You haven\t joined the stream yet!'
                        }));
                    }

                    const formatNewComment = {
                        user: newConnect,
                        content: dataReq.content,
                        sendAt: new Date()
                    }

                    await redisClient.rPush(`comment-stream-${dataReq.stream_id}`, JSON.stringify(formatNewComment));
                    const comments = await redisClient.lRange(`comment-stream-${dataReq.stream_id}`, 0, 19);
                    const commentList = comments.map(items => JSON.parse(items));
                    
                    await redisClient.publish('new-comment', JSON.stringify({
                        type: 'view-comment',
                        stream_id: dataReq.stream_id,
                        commentList
                    }));
                } catch (error) {
                    console.log('[WebSocket - SendComment]:: Error: ', error);
                }
            }

            if(dataReq.type==='delete-comment'){
                try {
                    const isInvalid = checkDataInvalid(dataReq);
                    if(!isInvalid){
                        return ws.send(JSON.stringify({
                            type: 'comment-error',
                            message: 'DataInput Invalid!'
                        }));
                    }

                    const comments = await redisClient.lRange(`comment-stream-${dataReq.stream_id}`, 0, 19);
                    const commentList = comments.map(items => JSON.parse(items));
                    const commentTarget = commentList[dataReq.index_comment];
                    if(!commentTarget){
                        return ws.send(JSON.stringify({
                            type: 'comment-error',
                            message: 'Comment Not Existed!'
                        }));
                    }


                    if(commentTarget?.user?.id!==newConnect.id){
                        return ws.send(JSON.stringify({
                            type: 'comment-error',
                            message: 'Accout Enough Rights!'
                        }));
                    }

                    await redisClient.lSet(`comment-stream-${dataReq.stream_id}`, dataReq.index_comment, '___DELETED___');
                    await redisClient.lRem(`comment-stream-${dataReq.stream_id}`, 1, '___DELETED___');
                    const newComments = await redisClient.lRange(`comment-stream-${dataReq.stream_id}`, 0, 19);
                    const newCommentList = newComments.map(items => JSON.parse(items));
                    await redisClient.publish('delete-comment', JSON.stringify({
                        type: 'view-comment',
                        stream_id: dataReq.stream_id,
                        commentList: newCommentList
                    }));
                } catch (error) {
                    console.log('[WebSocket - DeleteComment]:: Error: ', error);
                }
            }

            if(dataReq.type==='read-noti'){
                const readNoti_transaction = await sequelize.transaction();
                try {
                    const isRead = await isReadNotiLive(newConnect.id, dataReq.noti_id, readNoti_transaction);
                    if(typeof(isRead)==='string'){
                        ws.send(JSON.stringify({
                            type: 'read-noti-error',
                            message: isRead
                        }))
                    } else if(typeof(isRead)==='boolean'){
                        ws.send(JSON.stringify({
                            type: 'read-noti-ok',
                            payload: {
                                noti_id: dataReq.noti_id,
                                status: 'Success'
                            }
                        }));
                        await readNoti_transaction.commit();
                    } else await readNoti_transaction.rollback();
                } catch (error) {
                    await readNoti_transaction.rollback();
                    console.log('[WebSocket - ReadNotiLive]:: Error: ', error);
                }
            }

            if(dataReq.type === 'donate'){
                const streamRedis = await redisClient.get(`stream${dataReq.stream_id}`);
                const allViewerStream: any[] = JSON.parse(streamRedis!);
                const isWatching = allViewerStream.find(items => items?.id === newConnect.id);
                if(!isWatching) ws.send(JSON.stringify({
                    type: 'donate-error',
                    message: 'Bạn chưa tham gia phiên live này!'
                }));

                try {
                    let valueDonate = 0;
                    if(dataReq.item_id){
                        const parseIntItemID = parseInt(dataReq.item_id);
                        if(Number.isNaN(parseIntItemID)){
                            return ws.send(JSON.stringify({
                                type: 'donate-error',
                                message: 'ID Item Invalid!'
                            }));
                        }

                        const itemExisted = await DonateItemModel.findByPk(parseIntItemID);
                        if(!itemExisted){
                            return ws.send(JSON.stringify({
                                type: 'donate-error',
                                message: 'NotFound Item Matching ID Input!'
                            }));
                        }

                        valueDonate = parseInt(itemExisted.price as any);
                    }

                    const sub = newConnect.id;
                    const value = valueDonate!==0? valueDonate: dataReq.value;
                    const dataDonate = {
                        item_id: dataReq.item_id || null,
                        stream_id: dataReq.stream_id,
                        amount: value
                    }
                    const result = await addNewDonate(sub, dataDonate)
                    if(typeof(result)==='string'){
                        return ws.send(JSON.stringify({ type: 'donate-error', message: result }));
                    } else if (result===true){
                        await redisClient.publish('donate', JSON.stringify({
                            type: 'new-donate',
                            stream_id: dataReq.stream_id,
                            value: dataReq.value,
                            content: dataReq.content,
                            user: newConnect
                        }));
                    }
                } catch (error) {
                    logger.err('[WebSocket Error]:: Donate Error: ', error);
                    console.log(error)
                    ws.send(JSON.stringify({ type: 'donate-error', message: error.message }))
                }
            }
        });

        ws.on('close', async () => {
            const viewsCurrent = Array.from(arrViewer.values());
            viewsCurrent.forEach(async (items: any) => {
                if(items?.id === newConnect.id && items?.stream_id){
                    // const dataRedis = await redisClient.get(`stream${items?.stream_id}`);
                    // const streamCurrent: any[] = JSON.parse(dataRedis!);
                    // const changeView = streamCurrent?.filter(items => items?.id!==newConnect.id);

                    console.log('stream_id:', items?.stream_id);
                    console.log('key:', `stream${items?.stream_id}`);
                    // console.log('changeView:', changeView);

                    // await redisClient.set(`stream${items?.stream_id}`, JSON.stringify(changeView));
                    await redisClient.decr(`${items?.stream_id}`);
                    // arrViewer.delete(streamCurrent);
                    arrViewer.delete(`${items.stream_id}${newConnect.id}`);
                    await redisClient.publish('out-stream', JSON.stringify({
                        type: 'outed-stream',
                        stream_id: items.stream_id,
                        user_id: newConnect.id,
                        message: `${newConnect.username} Outed Stream`
                    }));
                }
            });

            allClient.delete(newConnect.id);
            console.log(`User ${newConnect.id} disconnected!`);
        });
    });
}
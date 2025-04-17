import { WebSocket, WebSocketServer } from "ws";
import sequelize from "../config/database";
import Comment from "../models/comment"
import { checkDataInvalid, findKeyInMap, getStreamKeyInConnection, saveNewConnectToWebSocket } from "./ws.service";
import { createNotiLive, isReadNotiLive } from "./model_db/ws.model.notification";
import { spawn } from "child_process";
import { Buffer } from 'buffer';
import path from "path";
import fs from "fs";
// import sharp from "sharp";
import { nmsConfig } from "~/config/nms";
import Stream from "../models/stream";
import redisClient from "~/API/helpers/redis";

export const arrViewer = new Map(); // Danh sách tài khoản tham gia một livestream.
export const arrStream = new Map(); // Danh sách livestream.
const allClient = new Map(); // Danh sách người dùng đang online.
const liveProcess = new Map(); // Danh sách tiến trình livestream.
const SERVER_ID = 'ws-creator';

export default async function WebSocket_Server (server: any) {
    await redisClient.configSet('notify-keyspace-events', 'Ex');
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
    await sub.subscribe('new-comment', data => {
        const { type, user, comment_id, payload } = JSON.parse(data);
        const viewers = Array.from(arrViewer.values()).filter(items => items?.stream_id === payload?.stream_id);
        viewers.forEach((items: any) => {
            if(items?.ws && items?.ws.readyState === WebSocket.OPEN){
                items.ws.send(JSON.stringify({ type, user, comment_id, content: payload?.content }));
            }
        });
    });
    await sub.subscribe('delete-comment', data => {
        const { type, stream_id, comment_id } = JSON.parse(data);
        const viewers = Array.from(arrViewer.values()).filter(items => items?.stream_id === stream_id);
        viewers.forEach((items: any) => {
            if(items?.ws && items?.ws.readyState === WebSocket.OPEN){
                items.ws.send(JSON.stringify({ type, comment_id }));
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

    console.log('WebSocket running...');

    websocket.on('connection', async (ws, req) => {
        const newConnect = await saveNewConnectToWebSocket(ws, req);
        if(!newConnect){
            console.log('[WebSocket]: Tự động ngắt kết nối do token không hợp lệ!');
            return ws.close();
        }
        allClient.set(newConnect.id, {
            id: newConnect.id,
            ws
        });
        console.log(`User ${newConnect.id} connected!`);

        // Phần xử lý stream.
        const streamKey = getStreamKeyInConnection(ws, req);
        if(streamKey){
            console.log('[WebSocket --- Connected]:: New Connected With Stream Key: ', streamKey);
            // Đường dẫn tới thư mục lưu trữ media/live/<stream_key>
            const mediaDir = path.join(nmsConfig.http.mediaroot, 'live', streamKey);
            if (!fs.existsSync(mediaDir)) {
                fs.mkdirSync(mediaDir, { recursive: true });
            }

            const ffmpeg = spawn(nmsConfig.trans.ffmpeg, [
                '-re', // Chế độ real-time.
                '-i', '-', // Dữ liệu đầu vào từ stdin.
                '-c:v', 'libx264', // Mã hóa video (H.264).
                '-preset', 'veryfast', // Tốc độ mã hóa.
                '-c:a', 'aac',
                '-f', 'flv',
                `rtmp://localhost:1935/live/${streamKey}`,
            ]);
            // const ffmpeg = spawn(nmsConfig.trans.ffmpeg, [
            //     // '-f', 'mjpeg',  // Nhận luồng MJPEG
            //     '-f', 'image2pipe', // Đọc từ stdin dưới dạng chuỗi hình ảnh
            //     '-vcodec', 'mjpeg', // Chỉ định codec của đầu vào là MJPEG
            //     '-r', '30', // Tốc độ khung hình đầu ra (30 fps)
            //     '-i', 'pipe:0', // Đọc từ stdin
            //     '-pix_fmt', 'yuv420p', // Định dạng pixel để đảm bảo tương thích
            //     '-c:v', 'libx264', // Bộ mã hóa video
            //     '-preset', 'veryfast', // Tốc độ mã hóa
            //     // '-tune', 'zerolatency', // Giảm độ trễ
            //     '-f', 'flv', // Định dạng đầu ra
            //     `rtmp://localhost:1935/live/${streamKey}` // URL RTMP
            // ]);

            ws.on('message', async (data) => {
                try {
                    liveProcess.set(streamKey, ffmpeg);
        
                    // Chuyển đổi nhị phân thành JPEG
                    // const jpegBuffer = await sharp(data)
                    //     .resize(640, 360) // Giới hạn độ phân giải
                    //     .jpeg({ quality: 50 }) // Giảm chất lượng
                    //     .toBuffer();
        
                    // Ghi dữ liệu JPEG vào stdin của FFmpeg
                    if (ffmpeg.stdin.writable) {
                        ffmpeg.stdin.write(data);
                    }
                } catch (error) {
                    console.error('Error processing image:', error);
                }
            });
            // ws.on('message', data => {
            //     // console.log('data Revieced: ', data)
            //     // Nhận ảnh Base64, chuyển thành buffer và gửi đến stdin của FFmpeg
            //     const buffer = Buffer.from(data, 'base64');
            //     // console.log('buffer: ', buffer)
            //     // liveProcess.set(streamKey, ffmpeg);
            //     if(ffmpeg.stdin.writable){
            //         ffmpeg.stdin.write(buffer);
            //     }
            // });

            ws.on('close', () => {
                console.log(`[WebSocket --- Disconnected]:: Stream Key ${streamKey} Closed!`);
                ffmpeg.stdin.end();
                ffmpeg.kill('SIGINT');
            });
    
            ws.on('error', error => {
                console.log('[WebSocket --- Error]:: ', error);
                ffmpeg.kill('SIGINT');
            })

            // Ghi log từ ffmpeg.
            ffmpeg.stderr.on('data', data => {
                console.log('[WebSocket --- FFMPEG]:: LOG: ', data.toString());
            });
            ffmpeg.stdout.on('data', data => {
                console.log('[FFMPEG STDOUT]::', data.toString()); // Ghi lại thông tin đầu ra của ffmpeg
            });
            
            // Dừng ffmpeg khi hoàn tất.
            ffmpeg.on('close', code => {
                console.log('[WebSocket --- FFMPEG]:: Closed: ', code);
            })

            ffmpeg.on('error', error => {
                console.log('[WebSocket --- FFMPEG]:: ERROR: ', error);
            })
        } else { // Các thao tác bình thường với ws.
            ws.on('message', async (data) => {
                const dataReq = JSON.parse(data.toString());
                // === Áp dụng cho cả creator và user ===  //
                if(dataReq.type==='set-online'){
                    ws.send(JSON.stringify({
                        type: 'online-user',
                        payload: { isOnline: true }
                    }))
                }

                // === Áp dụng cho role creator === //
                if(dataReq.type==='create-stream'){
                    // Môi trường thực tế sẽ sử dụng phần này.
                    // if(newConnect.role!=='admin'){
                    //     ws.send(JSON.stringify({
                    //         type: 'stream-error',
                    //         message: 'Acount Enough Rights!'
                    //     }));
                    // }

                    if(!newConnect.role || newConnect.role!=='creator'){
                        return ws.send(JSON.stringify({
                            type: 'stream-error',
                            message: 'Account Enough Rights!'
                        }));
                    }
                    arrStream.set(dataReq.stream_id, newConnect.id);
                    arrViewer.set(`${dataReq.stream_id}${newConnect.id}`, {
                        id: newConnect.id,
                        stream_id: dataReq.stream_id, 
                        ws
                    });
                    console.log(`[WebSocket]: Creator ${newConnect.id} Created Stream With ID: ${dataReq.stream_id}`);

                    // Tất cả người dùng đang xem live.
                    if(!await redisClient.get(`stream${dataReq.stream_id}`)){
                        const allViewer = [{
                            id: newConnect.id,
                        }];
                        await redisClient.set(`stream${dataReq.stream_id}`, JSON.stringify(allViewer));
                    }
                    // Lượng view của một live.
                    if(!await redisClient.get(`${dataReq.stream_id}`)){
                        await redisClient.set(`${dataReq.stream_id}`, 0);
                    } else {
                        return ws.send(JSON.stringify({
                            type: 'stream-error',
                            message: 'Stream Living!'
                        }));
                    }
                    // Lưu thông tin livestream.
                    await redisClient.hSet(`viewers-stream-${dataReq.stream_id}`, newConnect.id, SERVER_ID);
                    await redisClient.publish('join-stream', JSON.stringify({
                        stream_id: dataReq.stream_id,
                        message: null
                    }));

                    // Gửi thông báo live đến người dùng theo dõi.
                    const createNotiLive_transaction = await sequelize.transaction();
                    try {
                        if(!dataReq.noti_type || (dataReq.noti_type!=='live' && dataReq.noti_type!=='coin')){
                            return ws.send(JSON.stringify({
                                type: 'noti-error',
                                message: 'Type of Notify Invalid!'
                            }))
                        }
    
                        // Xử lý thông báo kiểu live.
                        if(dataReq.noti_type==='live'){
                            // Nếu không nhận được nội dung cần để tạo thông báo sẽ sử dụng thông báo mặc định.
                            const dataStream = {
                                title: dataReq.title? dataReq.title: `${newConnect.username} đã nhắc đến bạn`,
                                content: dataReq.content? dataReq.content: `Livestream của ${newConnect.fullname} đã bắt đầu. Hãy đến xem nhé!`
                            }
                            const allFollower = await createNotiLive(newConnect.id, dataStream);
                            // Trường hợp không có tài khoản nào theo dõi.
                            if(typeof(allFollower)==='string'){
                                return ws.send(JSON.stringify({
                                    type: 'sent-noti',
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

                if(dataReq.type==='end-stream'){
                    if(!newConnect.role || newConnect.role!=='creator'){
                        return ws.send(JSON.stringify({
                            type: 'stream-error',
                            message: 'Account Enough Rights!'
                        }));
                    }
                    
                    const streamExisted = await redisClient.get(`${dataReq.stream_id}`);
                    if(streamExisted){
                        const views = await redisClient.get(`${dataReq.stream_id}`);
                        const parseIntViews = views? parseInt(views): 0;
                        await Stream.update({ view: parseIntViews}, { where: { id: dataReq.stream_id }});
                        await redisClient.del(`${dataReq.stream_id}`);
                        await redisClient.del(`stream${dataReq.stream_id}`);
                    } else {
                        return ws.send(JSON.stringify({
                            type: 'stream-error',
                            message: 'Stream Not Live! Can\'t End Stream!'
                        }));
                    }

                    await redisClient.publish('end-stream', JSON.stringify({
                        type: 'ended-stream',
                        stream_id: dataReq.stream_id,
                        user_id: newConnect.id,
                        message: 'Phiên LIVE đã kết thúc!'
                    }));
                    const streamid = findKeyInMap(arrStream, newConnect.id);
                    arrStream.delete(streamid);
                    // Môi trường thực tế sử dụng phần này.
                    // const data = {
                    //     id: streamid,
                    //     end_time: new Date()
                    // }
                    // await UserStreamService.updateStream(data);
    
                    // allClient.delete(newConnect.id);
                }
    
                if(dataReq.type==='send-comment'){
                    const sendComment_transaction = await sequelize.transaction();
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
                            stream_id: dataReq.stream_id,
                            user_id: newConnect.id,
                            content: dataReq.content
                        }
                        const result = await Comment.create(formatNewComment, {
                            transaction: sendComment_transaction
                        });
    
                        await sendComment_transaction.commit();
                        await redisClient.publish('new-comment', JSON.stringify({
                            type: 'view-comment',
                            user: newConnect,
                            comment_id: result.id,
                            payload: formatNewComment
                        }));
                    } catch (error) {
                        sendComment_transaction.rollback();
                        console.log('[WebSocket - SendComment]:: Error: ', error);
                    }
                }
    
                if(dataReq.type==='delete-comment'){
                    const deleteComment_transaction = await sequelize.transaction();
                    try {
                        const isInvalid = checkDataInvalid(dataReq);
                        if(!isInvalid){
                            return ws.send(JSON.stringify({
                                type: 'comment-error',
                                message: 'DataInput Invalid!'
                            }));
                        }
    
                        const commentExisted = await Comment.findByPk(dataReq.comment_id);
                        if(!commentExisted){
                            return ws.send(JSON.stringify({
                                type: 'comment-error',
                                message: 'Comment Not Existed!'
                            }));
                        }

                        if(commentExisted.stream_id!==dataReq.stream_id){
                            return ws.send(JSON.stringify({
                                type: 'comment-error',
                                message: 'Comment Not Exist In LIVE!'
                            }))
                        }

                        const isCreator = arrStream.get(dataReq.stream_id);
                        if(isCreator!==newConnect.id){ // Nếu không phải chủ phiên LIVE.
                            // Kiểm tra bình luận muốn xóa có phải tài khoản của mình không.
                            if(commentExisted.user_id!==newConnect.id){
                                return ws.send(JSON.stringify({
                                    type: 'comment-error',
                                    message: 'You can only delete your own comments!'
                                }));
                            }
                        }
    
                        await Comment.destroy({
                            where: { id: dataReq.comment_id },
                            transaction: deleteComment_transaction
                        });
                        await deleteComment_transaction.commit();
                        await redisClient.publish('delete-comment', JSON.stringify({
                            type: 'deleted-comment',
                            stream_id: dataReq.stream_id,
                            comment_id: dataReq.comment_id
                        }));
                    } catch (error) {
                        deleteComment_transaction.rollback();
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
            });
    
            ws.on('close', async () => {    
                // Trường hợp creator ngắt kết nối.
                if(newConnect.role==='creator'){
                    const streamid = findKeyInMap(arrStream, newConnect.id);

                    const streamExisted = await redisClient.get(`${streamid}`);
                    if(streamExisted){
                        const views = await redisClient.get(`${streamid}`);
                        const parseIntViews = views? parseInt(views): 0;
                        await Stream.update({ view: parseIntViews, status: 'stop', end_time: new Date() }, { where: { id: streamid }});
                        await redisClient.del(`${streamid}`);
                        await redisClient.del(`stream${streamid}`);
                    }

                    await redisClient.publish('end-stream', JSON.stringify({
                        type: 'ended-stream',
                        stream_id: streamid,
                        user_id: newConnect.id,
                        message: 'Phiên LIVE đã kết thúc!'
                    }));
                    const keysStreamId = Array.from(arrViewer.keys());
                    keysStreamId.map(streams => {
                        if(streams.startsWith(streamid)){
                            arrViewer.delete(streams);
                        }
                    });
                    arrStream.delete(streamid);
                    allClient.delete(newConnect.id);
                    return console.log(`User ${newConnect.id} disconnected!`);
                }
            });
        }
    });
}
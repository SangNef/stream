import { WebSocketServer } from "ws";
import logger from "jet-logger";
import sequelize from "../config/database";
import Comment from "../models/comment"
import { broadcastNoti, checkDataInvalid, saveNewConnectToWebSocket } from "./ws.service";
import { isReadNotiLive } from "./model_db/ws.model.notification";
import { getAllCommentByStreamId } from "./model_db/ws.model.comment";
import redisClient from "../API/helpers/redis";
import config from "~/config";

export const arrViewer = new Map(); // Danh sách tài khoản tham gia một livestream.
export const arrStream = new Map(); // Danh sách livestream.
export const arrShowCmtStream = new Map(); // Số nhân hiển thị số lượng bản ghi comment trong một livestream.
const allClient = new Map(); // Danh sách người dùng đang online.

export default function WebSocket_Server (server: any) {
    const websocket = new WebSocketServer({ server });
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
            /** @type {StreamViewEntity} */
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
                if(arrStream.get(dataReq.stream_id)){
                    arrViewer.set(`${dataReq.stream_id}${newConnect.id}`, {
                        id: `${dataReq.stream_id}${newConnect.id}`,
                        ws
                    });
                    await redisClient.incr(`${dataReq.stream_id}`);
                    broadcastNoti(ws, dataReq.stream_id, newConnect, 'viewed-stream', false);
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
                    arrShowCmtStream.delete(`${dataReq.stream_id}${newConnect.id}`);
                    await redisClient.decr(`${dataReq.stream_id}`);
                    broadcastNoti(ws, dataReq.stream_id, newConnect, 'outed-stream', false);
                } else {
                    ws.send(JSON.stringify({
                        type: 'stream-error',
                        message: 'Stream Not Existed!'
                    }));
                }
            }

            // Tải thêm bình luận. Mỗi lần tải thêm 30, mặc định lấy ra 30 bình luận mới nhất.
            if(dataReq.type==='view-more-comment'){
                try {
                    const clientViewId = `${dataReq.stream_id}${newConnect.id}`;
                    let cmtStreamExisted = arrShowCmtStream.get(clientViewId);
                    // Kiểm tra xem có phải lần đầu người dùng truy vập stream hay không.
                    // Nếu đúng: tăng số lần truy cập lên 1 (sử dụng để lấy ra số lượng bản ghi).
                    // Nếu sai: set số lần truy cập bằng 1.
                    if(cmtStreamExisted){
                        arrShowCmtStream.delete(clientViewId);
                        arrShowCmtStream.set(clientViewId, cmtStreamExisted+=1);
                    } else arrShowCmtStream.set(clientViewId, 1);
                } catch (error) {
                    console.log('[WebSocket - ViewMoreComment]:: Error: ', error);
                }
            }

            if(dataReq.type==='view-comment'){
                const infoComment = await getAllCommentByStreamId(newConnect.id, dataReq.stream_id);
                ws.send(JSON.stringify({
                    type: 'data-comment',
                    payload: { message: (infoComment as any)?.comments? (infoComment as any).comments: 'Phiên LIVE chưa có bình luận. Hãy là người bình luận đầu tiên!' }
                }));
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
                    await Comment.create(formatNewComment, {
                        transaction: sendComment_transaction
                    });

                    await sendComment_transaction.commit();
                    broadcastNoti(ws, dataReq.stream_id, newConnect, 'view-comment', true);
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
                    await broadcastNoti(ws, dataReq.stream_id, newConnect, 'view-comment', true);
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
            const allStream = Array.from(arrViewer.keys());
            const streamCurrent = allStream.find(stream => stream.endsWith(`${newConnect.id}`));

            // Trường hợp user ngắt kết nối.
            const streamid = streamCurrent.split(`${newConnect.id}`)[0];
            // await UserViewerService.isNotViewStream(newConnect.id, streamid);
            broadcastNoti(ws, streamid.split(newConnect.id)[0], newConnect, 'outed-stream', false);
            arrViewer.delete(streamCurrent);
            arrShowCmtStream.delete(streamCurrent);
            allClient.delete(newConnect.id);
            console.log(`User ${newConnect.id} disconnected!`);
        });
    });
}
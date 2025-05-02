import { WebSocket } from "ws";
import { WSMessage } from "../wsTypes";
import { User } from "~/models";
import redisClient from "~/API/helpers/redis";
import { checkDataInvalid } from "../wsService";
import { viewStream } from "../viewStream";

export const VIEW_MORE_COMMENT = async (ws: WebSocket, data: WSMessage, info: User) => {
    const dataReq = data.payload;

    const limit = parseInt(dataReq?.limit);
    const comments = await redisClient.lRange(`comment-stream-${dataReq.stream_id}`, 0, limit);
    const commentList = comments.map(items => JSON.parse(items));
    ws.send(JSON.stringify({ type: 'view-comment', commentList }));
}

export const SEND_COMMENT = async (ws: WebSocket, data: WSMessage, info: User) => {
    const dataReq = data.payload;

    try {
        const isInvalid = checkDataInvalid(dataReq);
        if(!isInvalid){
            return ws.send(JSON.stringify({
                type: 'COMMENT_ERROR',
                message: 'Dữ liệu truyền vào không hợp lệ!'
            }));
        }

        const isJoinedStream = viewStream.get(`${dataReq.stream_id}${info.id}`);
        if(!isJoinedStream){
            return ws.send(JSON.stringify({
                type: 'COMMENT_ERROR',
                message: 'Bạn chưa tham gia phiên live này!'
            }));
        }

        const formatNewComment = {
            user: info,
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

export const DELETE_COMMENT = async (ws: WebSocket, data: WSMessage, info: User) => {
    const dataReq = data.payload;

    try {
        const isInvalid = checkDataInvalid(dataReq);
        if(!isInvalid){
            return ws.send(JSON.stringify({
                type: 'COMMENT_ERROR',
                message: 'Dữ liệu truyền vào không hợp lệ!'
            }));
        }

        const comments = await redisClient.lRange(`comment-stream-${dataReq.stream_id}`, 0, 19);
        const commentList = comments.map(items => JSON.parse(items));
        const commentTarget = commentList[dataReq.index_comment];
        if(!commentTarget){
            return ws.send(JSON.stringify({
                type: 'COMMENT_ERROR',
                message: 'Bình luận không tồn tại!'
            }));
        }


        if(commentTarget?.user?.id!==info.id){
            return ws.send(JSON.stringify({
                type: 'COMMENT_ERROR',
                message: 'Tài khoản không đủ quyền thực hiện thao tác!'
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
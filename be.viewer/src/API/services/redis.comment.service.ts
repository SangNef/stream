import { UserModelEntity } from "~/type/app.entities";
import redisClient from "../helpers/redis";

interface WS_User extends UserModelEntity {
    totalFollowed: number
}

interface Ws_Comment {
    users: WS_User
    content: string
    sentAt: string
}

class RedisCommentService {
    static getComments = async (streamId: number, page: number, limit: number) => {
        const pageCurrent = Number.isNaN(page)? 1: page;
        const recordOfPage = Number.isNaN(limit)? 20: limit;
        const start = (pageCurrent - 1) * recordOfPage;
        const end = start + recordOfPage - 1;

        const allComment = await redisClient.lRange(`comment-stream-${streamId}`, 0, -1);
        const comments = await redisClient.lRange(`comment-stream-${streamId}`, start, end);
        const commentList = comments.map(items => JSON.parse(items));

        return{
            totalPages: Math.ceil(allComment.length / recordOfPage),
            pageCurrent: pageCurrent,
            recordsOfPage: recordOfPage,
            records: commentList
        }
    }
}

export default RedisCommentService;
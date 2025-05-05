import { Request, Response } from "express";
import RedisCommentService from "../services/redis.comment.service";
import { OK } from "../core/SuccessResponse";

class RedisCommentController {
    static getComments = async (req: Request, res: Response) => {
        const streamId = parseInt(req.params.stream_id);
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);

        const result = await RedisCommentService.getComments(streamId, page, limit);
        return new OK({
            metadata: result,
            message: "Lấy danh sách bình luận thành công!"
        }).send(res);
    }
}

export default RedisCommentController;
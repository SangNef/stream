import { Comment, Stream, User } from "~/models";
import { BadRequestResponse, NotFoundResponse } from "../core/ErrorResponse";

class UserCommentService {
    static getComments = async (page: number, limit: number, stream_id: number) => {
        if(Number.isNaN(stream_id))
            throw new BadRequestResponse('Stream Not Exist!');

        const infoStream = await Stream.findOne({ where: {
            id: stream_id,
            end_time: null
        }});
        if(!infoStream) throw new NotFoundResponse('Livestream Not Exist!');

        const pageCurrent = Number.isNaN(page)? 1: page;
        const recordOfPage = Number.isNaN(limit)? 10: page;
        const offset = (pageCurrent-1)*recordOfPage;

        const result = await Comment.findAndCountAll({
            limit: recordOfPage,
            offset,
            attributes: ['id', 'user_id', 'content', 'createdAt', 'updatedAt', 'deletedAt'],
            include: [{
                model: User,
                as: 'users',
                attributes: ['fullname', 'username', 'avatar', 'role']
            }],
            order: [['id', 'DESC']],
            distinct: true,
            where: { stream_id }
        });

        return{
            totalItems: result.count,
            totalPages: Math.ceil(result.count / recordOfPage),
            pageCurrent: pageCurrent,
            recordsOfPage: recordOfPage,
            records: result.rows
        }
    }
}

export default UserCommentService;
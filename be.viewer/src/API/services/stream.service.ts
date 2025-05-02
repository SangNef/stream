import { literal } from 'sequelize';
import { BadRequestResponse, NotFoundResponse } from '../core/ErrorResponse';
import Stream from '../../models/stream';
import User from '../../models/user';
import Follower from '../../models/follower';

class UserStreamService {
    // Lấy tất cả stream (đã live, đang live), sắp xếp DESC theo lượt xem.
    static getStreamsHot = async (page: number, limit: number, is_streaming: boolean) => {
        const pageCurrent = Number.isNaN(page) ? 1 : page;
        const recordOfPage = Number.isNaN(limit) ? 10 : limit;
        const offset = (pageCurrent - 1) * recordOfPage;

        let condition = {} as any;
        if (is_streaming) condition.status = 'live'; // Chỉ lấy stream đang live.

        const result = await Stream.findAndCountAll({
            limit: recordOfPage,
            offset,
            attributes: ['id', 'thumbnail', 'stream_url', 'title', 'status', 'view', 'createdAt', 'deletedAt'],
            include: {
                model: User,
                as: 'users',
                attributes: ['id', 'fullname', 'username', 'avatar', 'role']
            },
            order: [['view', 'DESC'], ['id', 'DESC']],
            where: condition
        });

        return {
            recordOfPage,
            totalPages: Math.ceil(result.count / recordOfPage),
            pageCurrent,
            totalRecords: result.count,
            records: result.rows
        }
    }

    // - Lấy ra danh sách id của creator và số lần stream + lượt
    // xem tổng của từng creator id.
    // - Lọc theo khoảng thời gian (date) gồm:
    // + 1 tuần (date=week): quy ước bằng 7 ngày. 
    // + 1 tháng (date=month): quy ước bằng 30 ngày.
    static getCreatorHot = async (date: string) => {
        if(!date || (date!=='week' && date!=='month'))
            throw new BadRequestResponse('Tham số truyền vào không hợp lệ!');

        const today = new Date();
        const startDay = new Date();
        startDay.setHours(0, 0, 0, 0);
        let endDay = 0 as any;
        if (date === 'week') endDay = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (date === 'month') endDay = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDay.setHours(23, 59, 59, 999);

        const startString = startDay.toISOString();
        const endString = endDay.toISOString();
        const result = await User.findAll({
            limit: 10,
            attributes: [
                'id', 'fullname', 'username', 'avatar',
                [
                    literal(`(
                        SELECT COUNT(*) FROM streams a WHERE a.user_id = User.id
                        AND a.createdAt BETWEEN '${endString}' AND '${startString}'
                    )`),
                    'stream_times'
                ],
                [
                    literal(`(
                        SELECT COALESCE(SUM(a.view), 0) FROM streams a WHERE a.user_id = User.id
                        AND a.createdAt BETWEEN '${endString}' AND '${startString}'
                    )`),
                    'total_view'
                ]
            ],
            order: [[literal('total_view'), 'DESC']],
            where: { role: 'creator' }
        });

        return result;
    }

    // Nếu là creator => Lấy tất cả stream của bản thân 
    // Nếu là user => Lấy tất cả stream theo creator tìm kiếm.
    static getAllStreamBySub = async (creatorid: number, page: number, limit: number) => {
        if (Number.isNaN(creatorid)) throw new BadRequestResponse('Tham số truyền vào không hợp lệ!');

        const currentPage = Number.isNaN(page) ? 1 : page;
        const limitRecords = (Number.isNaN(limit)) ? 10 : limit;
        const offset = (currentPage - 1) * limitRecords;

        let condition = {} as any;
        condition.user_id = creatorid;

        const result = await Stream.findAndCountAll({
            limit: limitRecords,
            offset: offset,
            attributes: [
                'id', 'thumbnail', 'stream_url', 'status',
                'title', 'view', 'createdAt', 'updatedAt', 'deletedAt',
                [literal(`TIMESTAMPDIFF(SECOND, \`Stream\`.createdAt, \`Stream\`.updatedAt)`), 'timeLive']
            ],
            include: [{
                model: User,
                as: 'users',
                attributes: ['id', 'fullname', 'username', 'avatar']
            }],
            order: [['id', 'DESC'], ['view', 'DESC']],
            where: condition
        });

        return {
            recordsOfPage: limitRecords,
            totalPages: Math.ceil(result.count / limitRecords),
            pageCurrent: currentPage,
            totalStream: result.count,
            records: result.rows
        }
    }

    // Trả về stream_url mới nhất theo creator_id nhập vào.
    static getStreamUrlByCreatorId = async (creator_id: number) => {
        if (Number.isNaN(creator_id)) throw new BadRequestResponse('ID nhà sáng tạo nội dung không hợp lệ!');

        const creatorExisted = await User.findByPk(creator_id);
        if (!creatorExisted || creatorExisted.role !== 'creator')
            throw new NotFoundResponse('Nhà sáng tạo nội dung không tồn tại!');

        const result = await Stream.findOne({
            attributes: ['id', 'stream_url'],
            include: {
                model: User,
                as: 'users',
                attributes: [],
                where: { id: creator_id },
                required: true
            },
            where: { status: 'live' }
        });

        return result;
    }

    // Lấy danh sách stream của các creator đã theo dõi.
    static getListStreamOfCreatorFollowed = async (sub: number, page: number, limit: number) => {
        const pageCurrent = Number.isNaN(page) ? 1 : page;
        const recordOfPage = Number.isNaN(limit) ? 10 : limit;
        const offset = (pageCurrent - 1) * recordOfPage;

        const result = await Follower.findAndCountAll({
            limit: recordOfPage,
            offset,
            attributes: ['id'],
            include: {
                model: User,
                as: 'users_creator',
                attributes: ['id', 'fullname', 'username', 'avatar'],
                include: [{
                    model: Stream,
                    as: 'streams',
                    attributes: [
                        'id', 'thumbnail', 'stream_url', 'title', 'status', 'view', 'createdAt', 'updatedAt',
                        [literal(`TIMESTAMPDIFF(SECOND, \`users_creator\`.createdAt, \`users_creator\`.updatedAt)`), 'timeLive']
                    ],
                    order: [['id', 'DESC']]
                }]
            },
            where: { user_id: sub }
        });

        return {
            recordOfPage,
            totalPages: Math.ceil(result.count / recordOfPage),
            pageCurrent,
            totalRecords: result.count,
            records: result.rows
        }
    }
}

export default UserStreamService;
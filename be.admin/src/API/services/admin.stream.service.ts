import { literal, Op } from "sequelize";
import Stream from "../../models/stream";
import User from "../../models/user";
import { BadRequestResponse, NotFoundResponse } from "../core/ErrorResponse";
import { OK } from "../core/SuccessResponse";
import AdminHistoryService from "./admin.history.service";

class AdminStreamService {
    // Lấy ra tất cả (hoặc tìm kiếm một) stream đang live.
    static getAllStreamLiving = async (page: number, limit: number, search: string) => {
        const currentPage = Number.isNaN(page) ? 1 : page;
        const limitRecords = Number.isNaN(limit) ? 10 : limit;
        const offset = (currentPage - 1) * limitRecords;

        const strSearch = (search && search !== ':search') ? search : '';
        const condition = `%${strSearch}%`;
        const conditionSearch = {
            [Op.or]: [{ title: { [Op.like]: condition } }]
        }

        const result = await Stream.findAndCountAll({
            limit: limitRecords,
            offset: offset,
            attributes: ['id', 'thumbnail', 'stream_url', 'title', 'status', 'view', 'createdAt', 'updatedAt'],
            include: [
                {
                    model: User,
                    as: 'users',
                    attributes: ['id', 'fullname', 'username', 'avatar', 'balance'],
                    required: false
                }
            ],
            order: [['view', 'DESC'], ['id', 'DESC']],
            where: {
                [Op.and]: [
                    { status: 'live' },
                    {
                        [Op.or]: [
                            conditionSearch,
                            { '$users.username$': { [Op.like]: condition } },
                            { '$users.fullname$': { [Op.like]: condition } }
                        ]
                    }
                ]
            }
        });

        return {
            totalRecrods: result.count,
            totalPages: Math.ceil(result.count / limitRecords),
            pageCurrent: currentPage,
            recordsOfPage: limitRecords,
            records: result.rows
        }
    }
    
    static getAllStreamStop = async (page: number, limit: number, search: string) => {
        const currentPage = Number.isNaN(page) ? 1 : page;
        const limitRecords = Number.isNaN(limit) ? 10 : limit;
        const offset = (currentPage - 1) * limitRecords;

        const strSearch = (search && search !== ':search') ? search : '';
        const condition = `%${strSearch}%`;
        const conditionSearch = {
            [Op.or]: [{ title: { [Op.like]: condition } }]
        };

        const result = await Stream.findAndCountAll({
            limit: limitRecords,
            offset: offset,
            attributes: ['id', 'thumbnail', 'stream_url', 'title', 'status', 'view', 'createdAt', 'updatedAt'],
            include: [
                {
                    model: User,
                    as: 'users',
                    attributes: ['id', 'fullname', 'username', 'avatar', 'balance'],
                    required: false
                }
            ],
            order: [['view', 'DESC'], ['id', 'DESC']],
            where: {
                [Op.and]: [
                    { status: 'stop' },  // Stream đã kết thúc
                    {
                        [Op.or]: [
                            conditionSearch,
                            { '$users.username$': { [Op.like]: condition } },
                            { '$users.fullname$': { [Op.like]: condition } }
                        ]
                    }
                ]
            },
            paranoid: false // Nếu muốn lấy luôn cả bản ghi bị xóa mềm
        });

        return {
            totalRecords: result.count,
            totalPages: Math.ceil(result.count / limitRecords),
            pageCurrent: currentPage,
            recordsOfPage: limitRecords,
            records: result.rows
        };
    };

    // Lấy tất cả stream theo creator tìm kiếm.
    // Admin có thể lấy được cả những stream đã xóa mềm.
    static getAllStreamBySub = async (creatorid: number, page: number, limit: number) => {
        const currentPage = Number.isNaN(page) ? 1 : page;
        const limitRecords = (Number.isNaN(limit)) ? 10 : limit;
        const offset = (currentPage - 1) * limitRecords;

        let condition = {} as any;
        if (!Number.isNaN(creatorid)) condition.user_id = creatorid;

        const result = await Stream.findAndCountAll({
            limit: limitRecords,
            offset: offset,
            attributes: [
                'id', 'thumbnail', 'stream_url', 'status',
                'title', 'view', 'createdAt', 'updatedAt', 'deletedAt',
                [literal(`TIMESTAMPDIFF(SECOND, createdAt, updatedAt)`), 'timeLive'],
            ],
            include: [{
                model: User,
                as: 'users',
                attributes: ['id', 'fullname', 'username', 'avatar', 'balance']
            }],
            order: [['id', 'DESC'], ['view', 'DESC']],
            where: condition,
            paranoid: false
        });

        return {
            recordsOfPage: limitRecords,
            totalPages: Math.ceil(result.count / limitRecords),
            pageCurrent: currentPage,
            totalStream: result.count,
            records: result.rows
        }
    }

    static stopLiveStream = async (streamid: number, sub: number) => {
        if (Number.isNaN(streamid)) throw new BadRequestResponse('DataInput Invalid!');

        const streamLiving = await Stream.findOne({
            where: {
                status: 'live',
                id: streamid
            }
        });
        if (!streamLiving) throw new NotFoundResponse('NotFound Stream Living!');

        const streamUrlStoped = 'stopped:' + streamLiving.stream_url;
        const formatStream = {
            stream_url: streamUrlStoped,
            status: 'stop' as any
        }

        await Stream.update(formatStream, {
            where: { id: streamid }
        });
        await AdminHistoryService.addNew({
            admin_id: sub,
            action: `Đã cấm livestream ${streamid}`
        });

        return new OK({ message: "Stopped Livestream Successfully!" });
    }
}

export default AdminStreamService;
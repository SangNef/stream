import { literal, Op } from "sequelize";
import Stream from "../../models/stream";
import User from "../../models/user";
import { BadRequestResponse, NotFoundResponse } from "../core/ErrorResponse";
import AdminHistoryService from "./admin.history.service";
import { StreamStatus } from "~/type/app.entities";

class AdminStreamService {
    static getStreams = async (page: number, limit: number, search: string, status: string) => {
        const currentPage = Number.isNaN(page) ? 1 : page;
        const limitRecords = Number.isNaN(limit) ? 10 : limit;
        const offset = (currentPage - 1) * limitRecords;

        let condition = {} as any;
        if(search && search.trim()!=='') {
            const stringQuery = `%${search}%`;
            if (!condition[Op.or]) condition[Op.or] = [];

            condition[Op.or].push(
                { title: stringQuery },
                { '$users.username$': { [Op.like]: stringQuery } },
                { '$users.fullname$': { [Op.like]: stringQuery } }
            );
        }
        if(status && (status===StreamStatus.PENDING || status===StreamStatus.LIVE || status===StreamStatus.STOP)) condition.status = status;

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
            where: condition,
            distinct: true
        });

        return {
            totalRecrods: result.count,
            totalPages: Math.ceil(result.count / limitRecords),
            pageCurrent: currentPage,
            recordsOfPage: limitRecords,
            records: result.rows
        }
    }

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
        if (Number.isNaN(streamid)) throw new BadRequestResponse('ID stream không hợp lệ!');

        const streamLiving = await Stream.findOne({
            where: {
                status: StreamStatus.LIVE,
                id: streamid
            }
        });
        if (!streamLiving) throw new NotFoundResponse('Không tìm thấy livestream!');

        const streamUrlStoped = 'stopped:' + streamLiving.stream_url;
        const formatStream = {
            stream_url: streamUrlStoped,
            status: StreamStatus.STOP
        }

        const result = await Stream.update(formatStream, {
            where: { id: streamid }
        });
        await AdminHistoryService.addNew({
            admin_id: sub,
            action: `Đã cấm livestream ${streamid}`
        });

        return result;
    }
}

export default AdminStreamService;
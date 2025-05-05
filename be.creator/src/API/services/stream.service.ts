import { literal, Op } from 'sequelize';
import { BadRequestResponse, NotFoundResponse } from '../core/ErrorResponse';
import Stream from '../../models/stream';
import User from '../../models/user';
import Follower from '../../models/follower';
import { StreamModelEntity, StreamStatus, UserRole } from '~/type/app.entities';
import { ConfigModel, Donate, TransactionModel } from '~/models';

interface FilterStream extends StreamModelEntity {
    start_date: string
    end_date: string
}

class UserStreamService {
    // Lấy tất cả stream (đã live, đang live), sắp xếp DESC theo lượt xem.
    static getStreamsHot = async (page: number, limit: number, is_streaming: boolean) => {
        const pageCurrent = Number.isNaN(page) ? 1 : page;
        const recordOfPage = Number.isNaN(limit) ? 10 : limit;
        const offset = (pageCurrent - 1) * recordOfPage;

        let condition = {} as any;
        if (is_streaming) condition.status = StreamStatus.LIVE; // Chỉ lấy stream đang live.

        const result = await Stream.findAndCountAll({
            limit: recordOfPage,
            offset,
            attributes: ['id', 'thumbnail', 'stream_url', 'title', 'status', 'view', 'createdAt', 'updatedAt'],
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
    static getAllStreamBySub = async (sub: number, page: number, limit: number) => {
        const currentPage = Number.isNaN(page) ? 1 : page;
        const limitRecords = (Number.isNaN(limit)) ? 10 : limit;
        const offset = (currentPage - 1) * limitRecords;

        let condition = {} as any;
        condition.user_id = sub;

        const result = await Stream.findAndCountAll({
            limit: limitRecords,
            offset: offset,
            attributes: [
                'id', 'thumbnail', 'stream_url', 'status',
                'title', 'view', 'createdAt', 'updatedAt', 'deletedAt',
                [literal(`TIMESTAMPDIFF(SECOND, createdAt, updatedAt)`), 'timeLive'],
            ],
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

    // Chỉ lấy được thông tin stream do tài khoản của mình tạo ra.
    static getStreamById = async (id: number, sub: number) => {
        const result = await Stream.findOne({
            include: {
                model: User,
                as: 'users',
                attributes: [],
                where: { id: sub }
            },
            where: { id: id }
        });

        if (!result) throw new NotFoundResponse('Không tìm thấy bản ghi phù hợp với ID!');

        return result;
    }

    // Trả về stream_url mới nhất theo creator_id nhập vào.
    static getStreamUrlByCreatorId = async (creator_id: number) => {
        if (Number.isNaN(creator_id)) throw new BadRequestResponse('ID nhà sáng tạo nội dung không hợp lệ!');

        const creatorExisted = await User.findByPk(creator_id);
        if (!creatorExisted || creatorExisted.role !== UserRole.CREATOR)
            throw new NotFoundResponse('Không tìm thấy nhà sáng tạo nội dung phù hợp với ID!');

        const result = await Stream.findOne({
            attributes: ['id', 'stream_url'],
            include: {
                model: User,
                as: 'users',
                attributes: [],
                where: { id: creator_id },
                required: true
            },
            where: { status: StreamStatus.LIVE }
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
                        [literal(`TIMESTAMPDIFF(SECOND, \`users_creator->streams\`.createdAt, \`users_creator->streams\`.updatedAt)`), 'timeLive']
                    ]
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

    static statisticalByTime = async (sub: number, page: number, limit: number, filter: Partial<FilterStream>) => {
        const pageCurrent = Number.isNaN(page) ? 1 : page;
        const recordOfPage = Number.isNaN(limit) ? 10 : limit;
        const offset = (pageCurrent - 1) * recordOfPage;

        let condition = {} as any, conditionDonate = {} as any;
        // conditionDonate.type = 'donate';
        // conditionDonate.user_id = '';
        if(filter.start_date || filter.end_date){
            const startDate = new Date(filter.start_date!) as any;
            const endDate = new Date(filter.end_date!) as any;
            if (!isNaN(startDate) || !isNaN(endDate)) {
                if (!isNaN(startDate) && !isNaN(endDate)) {
                    startDate.setHours(0, 0, 0, 0);
                    endDate.setHours(23, 59, 59, 999);
                    const start = startDate.getTime() - 7 + 0 * 60 * 60 * 1000;
                    const end = endDate.getTime() - 7 + 0 * 60 * 60 * 1000;
                    condition.createdAt = { [Op.between]: [start, end] };
                    conditionDonate.createdAt = { [Op.between]: [start, end] };
                } else if (!isNaN(startDate) && isNaN(endDate)) {
                    startDate.setHours(0, 0, 0, 0);
                    const start = startDate.getTime() - 7 + 0 * 60 * 60 * 1000;
                    condition.createdAt = { [Op.gte]: start };
                    conditionDonate.createdAt = { [Op.gte]: start };
                } else if (isNaN(startDate) && !isNaN(endDate)) {
                    endDate.setHours(23, 59, 59, 999);
                    const end = endDate.getTime() - 7 + 0 * 60 * 60 * 1000;
                    condition.createdAt = { [Op.lte]: end };
                    conditionDonate.createdAt = { [Op.lte]: end };
                }
            }
        }

        const result = await User.findAndCountAll({
            limit: recordOfPage,
            offset,
            attributes: ['id', 'username', 'fullname'],
            include: [
                {
                    model: Follower,
                    as: 'followers',
                    attributes: ['id', 'follower_id', 'createdAt'],
                    where: condition
                },
                {
                    model: Stream,
                    as: 'streams',
                    attributes: ['id', 'view', 'createdAt'],
                    include: [{
                        model: Donate,
                        as: 'donates',
                        attributes: ['id', 'item_id', 'amount']
                    }]
                }
            ],
            where: { id: sub },
        });

        const percentConfig = await ConfigModel.findOne({
            where: { key: 'donate-percent' }
        });
        const percent = parseInt(percentConfig?.value!);

        let total = { follower: 0, donate: { sum: 0, revice: 0 }, view: 0 };
        let sumDonate = 0;
        result.rows.forEach((items: any) => {
            const followers = items?.followers;
            const streams = items?.streams;

            if(followers && Array.isArray(followers)) total.follower = followers.length
            if(streams && Array.isArray(streams)) {
                streams.forEach((str: any) => {
                    total.view += str?.view;
                    str?.donates?.forEach((don: any) => {
                        sumDonate += parseInt(don?.amount);
                    });
                    total.donate.sum = sumDonate;
                    total.donate.revice = (sumDonate * percent) / 100;
                });
            }
        })

        return total;
    }

    // Tạo stream mới. Nếu creator đang có stream nào khác sẽ dừng tất cả các stream cũ.
    static createStream = async (data: Partial<StreamModelEntity>) => {
        if (
            (!data.title || data.title === '') ||
            (!data.thumbnail || typeof (data.thumbnail) !== 'string' || data.thumbnail.trim() === '')
        )
            throw new BadRequestResponse('DataInput Invlalid!');

        const userExisted = await User.findByPk(data.user_id);
        if (!userExisted) throw new NotFoundResponse('User Not Exist!');
        const streamsLiving = await Stream.findAll({
            attributes: ['id', 'status'],
            where: { user_id: userExisted?.id, status: StreamStatus.LIVE }
        });
        if(streamsLiving){
            streamsLiving.forEach(async (items) => {
                await Stream.update(
                    { status: StreamStatus.STOP },
                    { where: { id: items?.id } }
                );
            });
        }

        const formatStream = {
            user_id: data.user_id!,
            thumbnail: data.thumbnail,
            stream_url: data.stream_url!,
            title: data.title,
            status: StreamStatus.PENDING,
            view: 0
        }
        const newStream = await Stream.create(formatStream);
        return newStream;
    }

    // Chỉ có thể sửa stream chưa dừng.
    // Sử dụng api này để dừng stream (cập nhật trường end_time).
    static updateStream = async (id: number, data: Partial<StreamModelEntity>) => {
        if (Number.isNaN(id)) throw new BadRequestResponse('DataInput Invalid!');

        const streamExisted = await Stream.findByPk(id);
        if (!streamExisted) throw new NotFoundResponse('Stream Not Exist!');
        if (streamExisted.status === StreamStatus.STOP) throw new BadRequestResponse('Can\'t Update Stream Ended!');

        if (data.thumbnail) {
            if (typeof (data.thumbnail) !== 'string' || data.thumbnail.trim() === '')
                throw new BadRequestResponse("Thumbnail Invalid!");
        }

        const formatStream = {
            thumbnail: data.thumbnail? data.thumbnail: streamExisted.thumbnail,
            stream_url: data.stream_url? data.stream_url: streamExisted.stream_url,
            title: data.title? data.title: streamExisted.title,
            status: StreamStatus.STOP
        }
        const result = await Stream.update(formatStream, {
            where: { id }
        });

        return result;
    }
}

export default UserStreamService;
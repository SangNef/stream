import { literal } from 'sequelize';
import { BadRequestResponse, NotFoundResponse } from '../core/ErrorResponse';
import Follower from '../../models/follower';
import Stream from '../../models/stream';
import User from '../../models/user';
import { FollowerModelEntity } from '../../type/app.entities';

class UserFollowerServie {
    // Có thể lấy stream_url theo creator đã theo dõi
    static getStreamInfoOfCreatorFollowed = async (user_id: number) => {
        if(Number.isNaN(user_id)) throw new BadRequestResponse('Tham số truyền vào không hợp lệ!');

        const result = await Follower.findAll({
            attributes: ['id', 'creator_id'],
            include: {
                model: User,
                as: 'users_creator',
                attributes: ['id', 'fullname', 'username', 'avatar', 'role'],
                include: [{
                    model: Stream,
                    as: 'streams',
                    attributes: ['id', 'thumbnail', 'stream_url', 'title', 'createdAt', 'updatedAt'],
                    where: { status: 'live' }
                }]
            },
            order: [['id', 'DESC']],
            where: { user_id }
        });

        return result;
    }

    // Lấy thông tin những creator đã theo dõi
    // kèm thêm trạng thái đang live hay không.
    static getInfoListCreatorFollowed = async (sub: number, page: number, limit: number) => {
        const pageCurrent = Number.isNaN(page)? 1: page;
        const recordOfPage = Number.isNaN(limit)? 10: limit;
        const offset = (pageCurrent - 1) * recordOfPage;

        const result = await Follower.findAndCountAll({
            limit: recordOfPage,
            offset,
            attributes: ['id'],
            include: {
                model: User,
                as: 'users_creator',
                attributes: [
                    'id', 'fullname', 'username', 'avatar',
                    [
                        literal(`(
                            SELECT
                                CASE
                                    WHEN COUNT(*) = 0 THEN false
                                    WHEN status = 'live' IS NULL THEN true
                                    ELSE false
                                END
                            FROM streams a WHERE a.user_id = users_creator.id ORDER BY a.createdAt DESC LIMIT 1
                        )`),
                        'is_live'
                    ]
                ]
            },
            where: { user_id: sub }
        })

        return {
            recordOfPage,
            totalPages: Math.ceil(result.count/recordOfPage),
            pageCurrent,
            totalRecords: result.count,
            records: result.rows
        }
    }

    static followCreator = async (data: Partial<FollowerModelEntity>) => {
        if(Number.isNaN(data.user_id) || Number.isNaN(data.user_id))
            throw new BadRequestResponse('Dữ liệu truyền vào không hợp lệ!');

        const creatorExisted = await User.findByPk(data.user_id);
        if(!creatorExisted || creatorExisted.role!=='creator')
            throw new NotFoundResponse('Nhà sáng tạo nội dung không tồn tại!');
        
        const checkFollowed = await Follower.findOne({ where: {
            user_id: data.user_id,
            creator_id: data.creator_id
        }});
        if(checkFollowed) throw new BadRequestResponse('Bạn đã theo dõi nhà sáng tạo này!');

        const formatFollower = {
            user_id: data.user_id!,
            creator_id: data.creator_id!
        }

        const result = await Follower.create(formatFollower);
        return result;
    }

    static unfollowCreator = async (data: Partial<FollowerModelEntity>) => {
        if(Number.isNaN(data.user_id) || Number.isNaN(data.creator_id))
            throw new BadRequestResponse('Tham số truyền vào không hợp lệ!');

        const followedCreator = await Follower.findOne({ where: {
            user_id: data.user_id,
            creator_id: data.creator_id
        }});
        if(!followedCreator) throw new NotFoundResponse('Chưa theo dõi nhà sáng tạo nội dung này!');

        const result = await Follower.destroy({
            where: { id: followedCreator.id}
        })
        return result;
    }
}

export default UserFollowerServie;
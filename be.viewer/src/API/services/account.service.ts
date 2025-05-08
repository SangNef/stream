import { col, fn, Op } from 'sequelize';
import { BadRequestResponse, NotFoundResponse } from '../core/ErrorResponse';
import { compare, hash } from '../helpers/bcrypt';
import { jwtSignAccessToken, jwtSignRefreshToken } from '../helpers/jwt';
import { Follower, User } from "../../models/index";
import Stream from '../../models/stream';
import * as dotenv from "dotenv";
import { UserModelEntity, UserRole } from '../../type/app.entities';
import redisClient from '../helpers/redis';

dotenv.config();

interface UserSignin extends UserModelEntity {
    device_id: string
}

class UserAccountService {
    //Lấy ra danh sách tất cả tài khoản người dùng
    // Hoặc lấy ra danh sách tài khoản người dùng theo role (creator, user)
    // Và tìm kiếm (nếu có)
    static getListUserAcc = async (roleAcc: string, search: string, page: number) => {
        const pageCurrent = !Number.isNaN(page)? page: 1;
        const recordsPage = 10;
        const offset = (pageCurrent - 1) * recordsPage;
        const accompanyInfo = [
            {
                model: Stream,
                as: 'streams',
                attributes: [
                    [fn('COUNT', col('streams.user_id')), 'totalStream']
                ],
                include: {
                    model: Follower,
                    as: 'creators',
                    attributes: [
                        [fn('COUNT', col('creators.creator_id')), 'totalFollower']
                    ]
                }
            },
            {
                model: Follower,
                as: 'viewers',
                attributes: [
                    [fn('COUNT', col('viewers.user_id')), 'totalFollow']
                ]
            }
        ]

        let condition = {} as any;
        if(roleAcc==='creator' || roleAcc==='user') condition.role = roleAcc;
        if(search && search!=='' && search!==':search'){
            const stringQuery = `%${search}%`;
            if (!condition[Op.or]) condition[Op.or] = [];

            condition[Op.or].push(
                { name: { [Op.like]: stringQuery}},
                { balance: { [Op.like]: stringQuery}}
            );
        }

        const result = await User.findAndCountAll({
            limit: recordsPage,
            offset,
            include: accompanyInfo as any,
            order: [['id', 'DESC']],
            where: condition
        });
        
        return{
            totalItems: result.count,
            totalPages: Math.ceil(result.count / recordsPage),
            pageCurrent: pageCurrent,
            recordsOfPage: recordsPage,
            records: result.rows
        }
    }

    static signin = async (data: Partial<UserSignin>) => {
        if(!data.username || !data.password || (!data.device_id || data.device_id.trim()===""))
            throw new BadRequestResponse('Dữ liệu truyền vào không hợp lệ!');

        const userExisted = await User.findOne({ where: {
            username: data.username
        }});
        if(!userExisted) throw new NotFoundResponse('Tài khoản không tồn tại!');

        if(!await(compare(data.password, userExisted.password)))
            throw new BadRequestResponse('Thông tin đăng nhập không chính xác!');

        const payload = { sub: userExisted.id, role: userExisted.role }

        const accessToken = jwtSignAccessToken(payload as any);
        const refreshToken = jwtSignRefreshToken(payload as any);

        const saveToRedis = { refreshToken, device_id: data.device_id }
        await redisClient.set(`rfToken-${userExisted.id}`, JSON.stringify(saveToRedis));
        console.log(">>> save to redis: ", saveToRedis);

        return{ accessToken, refreshToken };
    }

    static signup = async (data: Partial<UserModelEntity>) => {
        if(!data.username || !data.password)
            throw new BadRequestResponse('Dữ liệu truyền vào không hợp lệ!');

        const userExisted = await User.findOne({ where: {
            username: data.username
        }});
        if(userExisted) throw new BadRequestResponse('Tên tài khoản đã tồn tại!');

        const formatUser = {
            fullname: data.fullname!,
            username: data.username,
            password: await hash(data.password),
            role: data.role? data.role: UserRole.USER,
            avatar: data.avatar?? null,
            balance: data.balance? data.balance: 0
        }
        const result = await User.create(formatUser)
        return result;
    }

    static logout = async (data: Partial<UserSignin>) => {
        const authRedis = await redisClient.get(`rfToken-${data.id}`);
        if (!authRedis) throw new BadRequestResponse("Phiên đăng nhập không tồn tại! Không thể đăng xuất!");

        const result = await redisClient.del(`rfToken-${data.id}`);
        return result;
    }

    static updateAccount = async (data: Partial<UserModelEntity>) => {
        if(!data.id) throw new BadRequestResponse('Dữ liệu truyền vào không hợp lệ!');

        const infoAcc = await User.findByPk(data.id);
        const formatUser = {
            fullname: data.fullname ?? infoAcc!.fullname,
            username: data.username ?? infoAcc!.username,
            avatar: data.avatar ?? infoAcc!.avatar
        }
        const result = await User.update(formatUser, {
            where: { id: data.id}
        });
        return result;
    }

    // Chỉ xóa mềm (minh họa :v)
    static deleteAccount = async (sub: number) => {
        if(Number.isNaN(sub)) throw new BadRequestResponse('Dữ liệu truyền vào không hợp lệ!');

        const result = await User.destroy({ where: { id: sub}});
        return result;
    }

    static getProfile = async (userId: number) => {
        const user = await User.findByPk(userId, {
            attributes: ['id', 'fullname', 'username', 'role', 'avatar', 'coin'],
        });
    
        if (!user) throw new NotFoundResponse('Không tìm thấy người dùng!');
        return user;
    };    
}

export default UserAccountService;
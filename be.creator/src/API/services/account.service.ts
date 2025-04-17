import { col, fn, Op } from 'sequelize';
import { BadRequestResponse, NotFoundResponse } from '../core/ErrorResponse';
import { compare, hash } from '../helpers/bcrypt';
import { jwtSignAccessToken, jwtSignRefreshToken } from '../helpers/jwt';
import { User } from "../../models/index";
import Stream from '../../models/stream';
import Favourite from "../../models/favourite";
import * as dotenv from "dotenv";
import { UserModelEntity } from '~/type/app.entities';

dotenv.config();
const url_img = process.env.URL_IMG_IN_DB;

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
                    model: Favourite,
                    as: 'favourites',
                    attributes: [
                        [fn('COUNT', col('favourites.stream_id')), 'totalFollower']
                    ]
                }
            },
            {
                model: Favourite,
                as: 'favourites',
                attributes: [
                    [fn('COUNT', col('favourites.user_id')), 'totalFollow']
                ]
            }
        ]

        let condition = {} as any;
        condition.role = roleAcc;
        if(search && search!=='' && search!==':search'){
            const stringQuery = `%${search}%`;
            if (!condition[Op.or]) condition[Op.or] = [];

            condition[Op.or].push(
                { name: { [Op.like]: stringQuery}},
                { coin: { [Op.like]: stringQuery}}
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

    static signin = async (data: Partial<UserModelEntity>) => {
        if(!data.username || !data.password) throw new BadRequestResponse('DataInput Invalid!');

        const userExisted = await User.findOne({ where: {
            username: data.username
        }});
        if(!userExisted) throw new NotFoundResponse('NotFound Account Match DataInput!');

        if(!await(compare(data.password, userExisted.password)))
            throw new BadRequestResponse('Login Fail Because InfoInput Incorrect!');

        const payload = { sub: userExisted.id, role: userExisted.role }

        const accessToken = jwtSignAccessToken(payload as any);
        const refreshToken = jwtSignRefreshToken(payload as any);

        return{ accessToken, refreshToken };
    }

    static signup = async (data: Partial<UserModelEntity>) => {
        if(!data.username || !data.password)
            throw new BadRequestResponse('DataInput Invalid!');

        const userExisted = await User.findOne({ where: {
            username: data.username
        }});
        if(userExisted) throw new BadRequestResponse('Account Name Existed!');

        const formatUser = {
            fullname: data.fullname!,
            username: data.username,
            password: await hash(data.password),
            role: data.role? data.role: 'creator',
            avatar: data.avatar ?? null,
            coin: data.coin? data.coin: 0
        }

        const result = await User.create(formatUser);
        return result;
    }

    static updateAccount = async (data: Partial<UserModelEntity>) => {
        if(!data.id) throw new BadRequestResponse('DataInput Invalid!');

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
        if(Number.isNaN(sub)) throw new BadRequestResponse('DataInput Invalid!');

        const result = await User.destroy({ where: { id: sub}});
        return result;
    }

    static getProfile = async (userId: number) => {
        const user = await User.findByPk(userId, {
            attributes: ['id', 'fullname', 'username', 'role', 'avatar', 'coin'],
        });
    
        if (!user) throw new NotFoundResponse('User not found!');
        return user;
    };    
}

export default UserAccountService;
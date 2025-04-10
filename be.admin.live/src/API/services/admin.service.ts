import { BadRequestResponse, NotFoundResponse } from '../core/ErrorResponse';
import { Admin } from "../../models/index";
import { compare, hash } from '../helpers/bcrypt';
import { jwtSignAccessToken, jwtSignRefreshToken } from '../helpers/jwt';
import { Op } from 'sequelize';
import User from '../../models/user';
import { literal } from 'sequelize';
import * as dotenv from "dotenv";
import AdminHistoryService from './admin.history.service';
import { AdminModelEntity, UserModelEntity } from '../../type/app.entities';

dotenv.config();

class AdminService {
    static getListAdmin = async (search: string, page: number, limit: number, is_paranoid: boolean, sub: number) => {
        const pageCurrent = Number.isNaN(page)? 1 : page;
        const recordsPage = Number.isNaN(limit)? 10: limit;
        const offset = (pageCurrent - 1) * recordsPage;

        let condition = {} as any;
        condition.id = { [Op.ne]: sub };
        if(search && search!=='' && search!==':search'){
            const stringQuery = `%${search}%`;
            if (!condition[Op.or]) condition[Op.or] = [];

            condition[Op.or].push(
                { name: { [Op.like]: stringQuery}},
                { email: { [Op.like]: stringQuery}}
            );
        }

        const result = await Admin.findAndCountAll({
            limit: recordsPage,
            offset: offset,
            order: [['id', 'DESC']],
            where: condition,
            paranoid: is_paranoid
        });
        
        return{
            totalItems: result.count,
            totalPages: Math.ceil(result.count / recordsPage),
            pageCurrent: pageCurrent,
            recordsOfPage: recordsPage,
            records: result.rows
        }
    }

    static getListRoleUser = async(search: string, period: string, recordsLimit: number, page: number, isParanoid: boolean) => {
        const pageCurrent = Number.isNaN(page)? 1: page;
        const recordsPage = Number.isNaN(recordsLimit)? 10: recordsLimit;
        const offset = (pageCurrent - 1) * recordsPage;

        let condition = {} as any;
        condition.role = 'user';
        if(search && search!=='' && search!==':search'){
            const stringQuery = `%${search}%`;
            if(!condition[Op.or]) condition[Op.or] = [];
            condition[Op.or].push(
                { fullname: { [Op.like]: stringQuery}},
                { username: { [Op.like]: stringQuery}},
                { coin: { [Op.like]: stringQuery}}
            );
        }
        const today = new Date();
        const startDate = new Date();
        if(period==='month'){
            startDate.setMonth(startDate.getMonth()-1);
            condition.createdAt = { [Op.between]: [startDate, today] };
        } else if (period==='week'){
            startDate.setDate(startDate.getDate()-7);
            condition.createdAt = { [Op.between]: [startDate, today] };
        } else if (period==='day'){
            startDate.setDate(startDate.getDate()-1);
            condition.createdAt = { [Op.between]: [startDate, today] };
        }

        const result = await User.findAndCountAll({
            limit: recordsPage,
            offset: offset,
            attributes: [
                'id', 'fullname', 'username', 'avatar', 'role', 'coin', 'createdAt', 'deletedAt',
                [literal(`(SELECT COUNT(*) FROM followers WHERE followers.user_id = User.id)`), 'totalFollow']
            ],
            order: [['id', 'DESC']],
            where: condition,
            paranoid: isParanoid
        });

        return {
            totalItems: result.count,
            totalPages: Math.ceil(result.count/recordsPage),
            pageCurrent: pageCurrent,
            recordsOfPage: recordsPage,
            records: result.rows
        }
    }

    static getListRoleCreator = async(search: string, period: string, recordsLimit: number, page: number, is_paranoid: boolean) => {
        const pageCurrent = Number.isNaN(page)? 1: page;
        const recordsPage = Number.isNaN(recordsLimit)? 10: recordsLimit;
        const offset = (pageCurrent - 1) * recordsPage;

        let condition = {} as any;
        condition.role = 'creator';
        if(search && search!=='' && search!==':search'){
            const stringQuery = `%${search}%`;
            if(!condition[Op.or]) condition[Op.or] = [];

            condition[Op.or].push(
                { fullname: { [Op.like]: stringQuery}},
                { username: { [Op.like]: stringQuery}},
                { coin: { [Op.like]: stringQuery}}
            );
        }
        const today = new Date();
        const startDate = new Date();
        if(period==='month'){
            startDate.setMonth(startDate.getMonth()-1);
            condition.createdAt = { [Op.between]: [startDate, today] };
        } else if (period==='week'){
            startDate.setDate(startDate.getDate()-7);
            condition.createdAt = { [Op.between]: [startDate, today] };
        } else if (period==='day'){
            startDate.setDate(startDate.getDate()-1);
            condition.createdAt = { [Op.between]: [startDate, today] };
        }

        const result = await User.findAndCountAll({
            limit: recordsPage,
            offset: offset,
            attributes: [
                'id', 'fullname', 'username', 'avatar', 'role', 'coin', 'createdAt', 'deletedAt',
                [literal(`(SELECT COUNT(*) FROM followers WHERE followers.user_id = User.id)`), 'totalFollower'],
                [literal(`(SELECT COUNT(*) FROM followers WHERE followers.follower_id = User.id)`), 'totalFollow']
            ],
            order: [['id', 'DESC']],
            where: condition,
            paranoid: is_paranoid
        });

        return {
            totalItems: result.count,
            totalPages: Math.ceil(result.count/recordsPage),
            pageCurrent: pageCurrent,
            recordsOfPage: recordsPage,
            records: result.rows
        }
    }

    static signin = async (data: AdminModelEntity) => {
        if(
            (!data.email || data.email==='') ||
            (!data.password || data.password==='')
        ) throw new BadRequestResponse('Data Input Invalid!');

        const accExisted = await Admin.findOne({ where: {
            email: data.email,
        }});
        if(!accExisted) throw new NotFoundResponse('Not Found Accont Match DataInput!');

        if(!await(compare(data.password, accExisted.password)))
            throw new BadRequestResponse('Login Fail Because InfoInput Incorrect!');

        const payload = { sub: accExisted.id, role: 'admin' }

        const accessToken = jwtSignAccessToken(payload as any);
        const refreshToken = jwtSignRefreshToken(payload as any);

        return{ accessToken, refreshToken };
    }

    static signup = async (sub: number, data: AdminModelEntity) => {
        if(!data.email || !data.name || !data.password)
            throw new BadRequestResponse('DataInput Invalid!');

        const accExisted = await Admin.findOne({ where: {
            [Op.or]: [
                { email: data.email},
                { name: data.name}
            ]
        }});
        if(accExisted) throw new BadRequestResponse('Email or Name Account Existed!');

        let isRoot = 0 as any;
        const infoSub = await Admin.findByPk(sub);
        if(infoSub?.is_root===true && (data.is_root && typeof(data.is_root)==='boolean')){
            isRoot = data.is_root
        }

        const hashPass = await hash(data.password);
        const formatAdmin = {
            name: data.name,
            email: data.email,
            password: hashPass,
            is_root: isRoot || false
        }
        const result = await Admin.create(formatAdmin);

        return result;
    }

    static createUserAccount = async (data: UserModelEntity) => {
        if(
            (!data.username || data.username==='') ||
            (!data.fullname || data.fullname==='') ||
            (!data.password || data.password==='')
        ) throw new BadRequestResponse('DataInput Invalid!');

        const userExisted = await User.findOne({
            where: { username: data.username}
        });
        if(userExisted) throw new BadRequestResponse('Username Existed!');

        const formatUser = {
            fullname: data.fullname,
            username: data.username,
            password: await hash(data.password),
            role: 'creator' as 'user' | 'creator',
            avatar: data.avatar || null,
            coin: 0,
            phone: data.phone || null
        }
        const result = await User.create(formatUser);

        return result;
    }

    static updateUserAccount = async (user_id: number, data: UserModelEntity, sub: number) => {
        const { coin, phone, fullname, username } = data;
        
        if(
            Number.isNaN(user_id) ||
            (coin && typeof(coin)!=='number') ||
            (phone && (typeof(phone)!=='string' || phone.trim()==='')) ||
            (fullname && (typeof(fullname)!=='string' || fullname.trim()==='')) ||
            (username && (typeof(username)!=='string' || username.trim()===''))
        ) throw new BadRequestResponse('DataInput Invalid!');

        const userExisted = await User.findByPk(user_id);
        if(!userExisted) throw new NotFoundResponse('User Not Exist!');

        const usernameExisted = await User.findOne({
            where: { username }
        });
        if(usernameExisted) throw new BadRequestResponse('Username Existed!');

        const formatUser = {
            fullname: fullname ?? userExisted.fullname,
            username: username ?? userExisted.username,
            coin: coin ?? userExisted.coin,
            phone: (phone || phone===null)? phone: userExisted.phone
        }

        const result = await User.update(formatUser, {
            where: { id: user_id }
        });
        await AdminHistoryService.addNew({
            admin_id: sub,
            action: 'put',
            model: 'user',
            data_input: JSON.stringify({ user_id, data }),
            init_value: JSON.stringify(userExisted),
            change_value: JSON.stringify(formatUser)
        });

        return result;
    }

    static updateAdminAccount = async (sub: number, user_id: number, data: AdminModelEntity) => {
        const { name, email, is_root } = data;
        if(
            (name && (typeof(name)!=='string' || name.trim()==='')) ||
            (email && (typeof(email)!=='string' || email.trim()==='' || !email.includes('@')))
        ) throw new BadRequestResponse('Dữ liệu truyền vào không hợp lệ!');

        const infoAcc = await Admin.findByPk(sub);
        if(!infoAcc!.is_root){
            const formatAdmin = {
                name: name ?? infoAcc!.name,
                email: email ?? infoAcc!.email,
            }

            const result = await Admin.update(formatAdmin, { where: { id: sub }});
            await AdminHistoryService.addNew({
                admin_id: sub,
                action: 'put',
                model: 'admin',
                data_input: JSON.stringify({ user_id, data }),
                init_value: JSON.stringify(infoAcc),
                change_value: JSON.stringify(formatAdmin)
            });

            return result;
        } else {
            let formatAdmin = {};

            if(!Number.isNaN(user_id)){
                const adminExisted = await Admin.findByPk(user_id);
                if(!adminExisted) throw new NotFoundResponse('Admin Not Exist!');

                formatAdmin = {
                    name: name ?? adminExisted.name,
                    email: email ?? adminExisted.email,
                    is_root: is_root ?? adminExisted.is_root
                }
            } else {
                formatAdmin = {
                    name: name ?? infoAcc!.name,
                    email: email ?? infoAcc!.email,
                    is_root: is_root ?? infoAcc!.is_root
                }
            }

            const id = Number.isNaN(user_id)? sub: user_id;
            const result = await Admin.update(formatAdmin, { where: { id }});
            await AdminHistoryService.addNew({
                admin_id: sub,
                action: 'put',
                model: 'admin',
                data_input: JSON.stringify({ id, data }),
                init_value: Number.isNaN(user_id)? JSON.stringify(infoAcc): JSON.stringify(await Admin.findByPk(user_id)),
                change_value: JSON.stringify(formatAdmin)
            });

            return result;
        }
    }

    static softDeleteUserAccount = async (id: number, isDelete: boolean, sub: number) => {
        if(Number.isNaN(id)) throw new BadRequestResponse('DataInput Invalid!');

        let result, message = '', init_data = {};
        if(isDelete){
            const userExisted = await User.findByPk(id);
            if(!userExisted) throw new NotFoundResponse('NotFound Record Match ID!');

            init_data = userExisted;
            result = await User.destroy({ where: { id: id}});
            message = "Deleted Successfully!";
        } else {
            const userDeleted = await User.findOne({ 
                where: { deletedAt: {[Op.ne]: null}}, 
                paranoid: false
            })
            if(!userDeleted) throw new NotFoundResponse('RecordID Never Delete!');
    
            result = await User.restore({ where: { id: id}});
            message = "Restored Successfully!";
        }

        await AdminHistoryService.addNew({
            admin_id: sub,
            action: isDelete? 'delete': 'restore',
            model: 'user',
            data_input: JSON.stringify({ id, is_delete: isDelete }),
            init_value: (isDelete? init_data: null) as any,
            change_value: (isDelete? null: JSON.stringify(await User.findByPk(id))) as any
        });

        return { result, message };
    }

    static softDeleteAdminAccount = async (id: number, is_delete: boolean, sub: number) => {
        if(Number.isNaN(id)) throw new BadRequestResponse('DataInput Invalid!');

        let result, message = '', init_data = {};
        if(is_delete){
            const adminExisted = await Admin.findByPk(id);
            if(!adminExisted) throw new NotFoundResponse('NotFound Record Match ID!');

            init_data = adminExisted;
            result = await Admin.destroy({ where: { id }});
            message = "Deleted Successfully!";
        } else {
            const adminDeleted = await Admin.findOne({ 
                where: { deletedAt: {[Op.ne]: null}}, 
                paranoid: false
            })
            if(!adminDeleted) throw new NotFoundResponse('RecordID Never Delete!');
    
            result = await Admin.restore({ where: { id }});
            message = "Restored Successfully!";
        }

        await AdminHistoryService.addNew({
            admin_id: sub,
            action: is_delete? 'delete': 'restore',
            model: 'admin',
            data_input: JSON.stringify({ id, is_delete }),
            init_value: (is_delete? init_data: null) as any,
            change_value: (is_delete? null: JSON.stringify(await Admin.findByPk(id))) as any
        });

        return { result, message };
    }
}

export default AdminService;
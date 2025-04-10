import { literal, Op } from "sequelize";
import User from "../../models/user";
import TransactionModel from "../../models/transaction";
import { BadRequestResponse, NotFoundResponse } from "../core/ErrorResponse";
import { getConfigByKey } from "../helpers/function";

class UserTransactionService {
    // Chỉ dành cho creator.
    static getListInfoUserDonated = async (sub: number, page: number, limit: number, search: string) => {
        const pageCurrent = Number.isNaN(page)? 1: page;
        const recordsOfPage = Number.isNaN(limit)? 10: limit;
        const offset = (pageCurrent-1)*recordsOfPage;

        let condition = {} as any;
        if(search){
            if (!condition[Op.or]) condition[Op.or] = [];

            condition[Op.or].push(
                { fullname: { [Op.like]: `%${search}%` }},
                { username: { [Op.like]: `%${search}%` }},
            )
        }

        const result = await TransactionModel.findAndCountAll({
            limit: recordsOfPage,
            offset,
            attributes: ['id', 'implementer', 'value', 'content', 'createdAt'],
            include: [{
                model: User,
                as: 'user_imp',
                attributes: [
                    'fullname', 'username', 'avatar', 'role', 'phone',
                    [literal(`(SELECT COUNT(*) FROM followers a JOIN users b ON a.user_id = b.id WHERE b.id = Transaction.implementer)`), 'totalFollower'],
                    [literal(`(SELECT COUNT(*) FROM followers a JOIN users b ON a.follower_id = b.id WHERE b.id = Transaction.implementer)`), 'totalFollowed']
                ],
                where: condition
            }],
            order: [['id', 'DESC']],
            where: { type: 'donate', receiver: sub },
            distinct: true
        });

        let percent = 0;
        const keyCommissionPercent = await getConfigByKey('donate-percent');
        if(keyCommissionPercent){
            percent = parseInt(keyCommissionPercent.value);
        }

        let totalDonate = 0, totalRevice = 0;
        result.rows.map(items => {
            totalDonate += parseInt(items.value);
        });
        totalRevice = (totalDonate*percent)/100;

        return {
            totalItems: result.count,
            totalPages: Math.ceil(result.count/recordsOfPage),
            pageCurrent,
            recordsOfPage,
            totalDonate,
            percent,
            totalRevice,
            records: result.rows
        }
    }

    // User/Creator: Lấy lịch sử giao dịch của chính mình.
    static getHistoryTransachtion = async (page: number, limit: number, user_id: number) => {
        if(Number.isNaN(user_id))
            throw new BadRequestResponse('ParamInput Invalid!');

        const userExisted = await User.findByPk(user_id);
        if(!userExisted) throw new NotFoundResponse('User Not Exist!');

        const pageCurrent = Number.isNaN(page)? 1: page;
        const recordsOfPage = Number.isNaN(limit)? 10: limit;
        const offset = (pageCurrent-1)*recordsOfPage;

        const result = await TransactionModel.findAndCountAll({
            limit: recordsOfPage,
            offset,
            attributes: ['id', 'implementer', 'receiver', 'type', 'value', 'content', 'createdAt'],
            order: [['id', 'DESC']],
            where: {
                [Op.or]: [
                    { implementer: user_id },
                    { receiver: user_id }
                ]
            }
        });

        let totalIn = 0, totalOut = 0;
        result.rows.map(items => {
            if(items.implementer===user_id){
                totalOut += parseInt(items.value);
            }
            if(items.receiver===user_id){
                totalIn += parseInt(items.value);
            }
        });

        return {
            totalItems: result.count,
            totalPages: Math.ceil(result.count/recordsOfPage),
            pageCurrent,
            recordsOfPage,
            totalIn,
            totalOut,
            records: result.rows
        }
    }

    // Chỉ dành cho user/creator.
    static addNew = async (sub: number, type: 'recharge' | 'donate' | 'withdraw', value: number, content: string) => {
        if(
            Number.isNaN(value) ||
            (type!=='recharge' && type!=='withdraw')
        ) throw new BadRequestResponse('DataInput Invalid!');

        if(type==='withdraw'){
            const infoUser = await User.findByPk(sub);
            if(infoUser!.coin < value)
                throw new BadRequestResponse('Cannot Withdraw Money! Coin Enough!');
        }

        const formatTransaction = {
            implementer: null,
            receiver: sub,
            type,
            is_success: false,
            is_cancel: false,
            value: value as any,
            content: type==='recharge'?
                (content && typeof(content)==='string' && content.trim()!=='')?
                content:
                'NẠP TIỀN HỆ THỐNG':
                (content && typeof(content)==='string' && content.trim()!=='')?
                content:
                'RÚT TIỀN HỆ THỐNG'
        }

        const result = await TransactionModel.create(formatTransaction);
        return result;
    }
}

export default UserTransactionService;
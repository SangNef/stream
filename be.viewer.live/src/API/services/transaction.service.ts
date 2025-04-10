import { literal, Op } from "sequelize";
import User from "../../models/user";
import ConfigModel from "../../models/config";
import TransactionModel from "../../models/transaction";
import { BadRequestResponse, NotFoundResponse } from "../core/ErrorResponse";

class UserTransactionService {
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
    static addNew = async (sub: number, type: 'recharge' | 'donate' | 'withdraw', value: number, content: string, receiver?: number) => {
        if(
            Number.isNaN(value) ||
            (type!=='recharge' && type!=='donate')
        ) throw new BadRequestResponse('DataInput Invalid!');

        let impId = null, infoUser: User | null = {} as any;
        if(type==='donate'){
            infoUser = await User.findByPk(sub);
            if(Number.isNaN(receiver))
                throw new BadRequestResponse('Receiver Invalid!');
            if(infoUser!.coin < value)
                throw new BadRequestResponse('Coin Enough!');

            impId = sub;
        }

        const formatTransaction = {
            implementer: impId,
            receiver: impId? receiver!: sub,
            type,
            is_success: type==='donate'? true: false,
            is_cancel: false,
            value: value as any,
            content: type==='recharge'?
                (content && typeof(content)==='string' && content.trim()!=='')?
                content:
                'NẠP TIỀN HỆ THỐNG':
                (content && typeof(content)==='string' && content.trim()!=='')?
                content:
                `ỦNG HỘ NHÀ SÁNG TẠO ${value}đ.`
        }

        const result = await TransactionModel.create(formatTransaction);

        if(type==='donate'){
            let percent = 0;
            const keyCommissionPercent = await ConfigModel.findOne({ where: {
                key: 'donate-percent'
            }});
            if(keyCommissionPercent){
                percent = parseInt(keyCommissionPercent.value)/100;
            }

            const infoRec = await User.findByPk(receiver);
            const totalCoin = infoRec?.coin! + (value*percent);

            const updateCoin = infoUser!.coin - value;
            await User.update(
                { coin: updateCoin },
                { where: { id: sub }}
            );
            await User.update(
                { coin: totalCoin },
                { where: { id: receiver } }
            );
        }

        return result;
    }
}

export default UserTransactionService;
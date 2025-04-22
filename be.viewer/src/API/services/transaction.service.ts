import { Op } from "sequelize";
import User from "../../models/user";
import ConfigModel from "../../models/config";
import TransactionModel from "../../models/transaction";
import { BadRequestResponse, NotFoundResponse } from "../core/ErrorResponse";
import { TransactionStatus, TransactionType } from "~/type/app.entities";

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
            attributes: ['id', 'user_id', 'type', 'amount', 'status', 'createdAt'],
            order: [['id', 'DESC']],
            where: { user_id }
        });

        let totalIn = 0, totalOut = 0;
        result.rows.map(items => {
            if(items.type==='withdraw'){
                totalOut += parseInt(items.amount as any);
            }
            if(items.type==='deposit'){
                totalIn += parseInt(items.amount as any);
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
    static addNew = async (sub: number, type: 'deposit' | 'withdraw', value: number) => {
        if(
            Number.isNaN(value) ||
            (type!=='deposit' && type!=='withdraw')
        ) throw new BadRequestResponse('DataInput Invalid!');

        const formatTransaction = {
            user_id: sub,
            type: type as TransactionType,
            amount: value,
            status: 'pending' as TransactionStatus
        }

        const result = await TransactionModel.create(formatTransaction);

        return result;
    }
}

export default UserTransactionService;
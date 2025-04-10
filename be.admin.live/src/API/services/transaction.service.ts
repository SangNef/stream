import { cast, Op } from "sequelize";
import TransactionModel from "../../models/transaction";
import { BadRequestResponse, NotFoundResponse } from "../core/ErrorResponse";
import User from "../../models/user";
import AdminHistoryService from "./admin.history.service";

class AdminTransactionService {
    // Admin: Lấy lịch sử giao dịch của user chỉ định.
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

    static getTransactions = async (
        sub: number, page: number, limit: number, implementer: number | null, receiver: number, type: string,
        is_all: boolean, is_success: boolean, is_cancel: boolean, min_value: number, max_value: number,
        value: number, start_date: string, end_date: string
    ) => {
        const pageCurrent = Number.isNaN(page)? 1: page;
        const recordsOfPage = Number.isNaN(limit)? 10: limit;
        const offset = (pageCurrent-1)*recordsOfPage;

        let condition = {} as any;
        if(!Number.isNaN(implementer) || implementer===null) condition.implementer = implementer;
        if(!Number.isNaN(receiver)) condition.receiver = receiver;
        if(type) condition.type = { [Op.like]: `%${type}%` };
        if(!is_all){
            if(typeof(is_success)==='boolean') condition.is_success = is_success;
            if(typeof(is_cancel)==='boolean') condition.is_cancel = is_cancel;
        }
        if(!Number.isNaN(value)) condition.value = value;
        if(!Number.isNaN(min_value) && !Number.isNaN(max_value)){
            if(min_value>max_value)
                throw new BadRequestResponse('Param min/max_value in query invalid!');

            condition.value = { [Op.between]: [cast(min_value, 'DECIMAL(10, 2)'), cast(max_value, 'DECIMAL(10, 2)')] };
        } else if (!Number.isNaN(min_value) && Number.isNaN(max_value)) {
            condition.value = { [Op.gte]: cast(min_value, 'DECIMAL(10, 2)') };
        } else if (Number.isNaN(min_value) && !Number.isNaN(max_value)) {
            condition.value = { [Op.lte]: cast(max_value, 'DECIMAL(10, 2)') }
        }
        if(start_date || end_date){
            const startDate = new Date(start_date) as any;
            const endDate = new Date(end_date) as any;
            if (!isNaN(startDate) || !isNaN(endDate)) {
                if (!isNaN(startDate) && !isNaN(endDate)) {
                    startDate.setHours(0, 0, 0, 0);
                    endDate.setHours(23, 59, 59, 999);
                    const start = startDate.getTime() - 7 + 0 * 60 * 60 * 1000;
                    const end = endDate.getTime() - 7 + 0 * 60 * 60 * 1000;
                    condition.createdAt = { [Op.between]: [start, end] };
                } else if (!isNaN(startDate) && isNaN(endDate)) {
                    startDate.setHours(0, 0, 0, 0);
                    const start = startDate.getTime() - 7 + 0 * 60 * 60 * 1000;
                    condition.createdAt = { [Op.gte]: start };
                } else if (isNaN(startDate) && !isNaN(endDate)) {
                    endDate.setHours(23, 59, 59, 999);
                    const end = endDate.getTime() - 7 + 0 * 60 * 60 * 1000;
                    condition.createdAt = { [Op.lte]: end };
                }
            }
        }

        const result = await TransactionModel.findAndCountAll({
            limit: recordsOfPage,
            offset,
            attributes: ['id', 'implementer', 'receiver', 'type', 'is_success', 'is_cancel', 'value', 'content', 'createdAt', 'updatedAt'],
            include: [
                {
                    model: User,
                    as: 'user_imp',
                    attributes: ['id', 'fullname', 'username', 'avatar', 'role', 'coin', 'phone'],
                },
                {
                    model: User,
                    as: 'user_rec',
                    attributes: ['id', 'fullname', 'username', 'avatar', 'role', 'coin', 'phone'],
                }
            ],
            order: [['id', 'DESC']],
            where: condition
        });

        return {
            totalItems: result.count,
            totalPages: Math.ceil(result.count/recordsOfPage),
            pageCurrent,
            recordsOfPage,
            records: result.rows
        }
    }

    static submitTransaction = async (transaction_id: number, sub: number) => {
        if(Number.isNaN(transaction_id))
            throw new BadRequestResponse('ParamInput Invalid!');

        const transactionExisted = await TransactionModel.findOne({ where: {
            id: transaction_id,
            is_success: false
        }});
        if(!transactionExisted) throw new NotFoundResponse('NotFound This Transaction!');

        const formatTransaction = {
            is_success: true
        }
        const result = await TransactionModel.update(formatTransaction, {
            where: { id: transaction_id }
        });

        await AdminHistoryService.addNew({
            admin_id: sub,
            action: 'put',
            model: 'transaction',
            data_input: JSON.stringify({ transaction_id }),
            init_value: transactionExisted as any,
            change_value: (await TransactionModel.findByPk(transaction_id)) as any
        });

        const infoUser = await User.findByPk(transactionExisted.receiver);
        if(transactionExisted.type==='recharge'){
            const updateCoin = parseInt(infoUser!.coin as any) + parseInt(transactionExisted.value);
            await User.update(
                { coin: updateCoin },
                { where: { id: transactionExisted.receiver } }
            );
        }
        if(transactionExisted.type==='withdraw'){
            const updateCoin = parseInt(infoUser!.coin as any) - parseInt(transactionExisted.value);
            await User.update(
                { coin: updateCoin },
                { where: { id: transactionExisted.receiver } }
            );
        }

        return result;
    }

    // Hủy hoặc khôi phục yêu cầu chưa được phê duyệt.
    // ---> Chỉ có thể hủy được các yêu cầu chưa phê duyệt.
    static cancelTransaction = async (transaction_id: number, is_cancel: boolean, sub: number) => {
        if(Number.isNaN(transaction_id))
            throw new BadRequestResponse('ParamInput Invalid!');

        const transactionExisted = await TransactionModel.findOne({ where: {
            id: transaction_id,
            is_success: false
        }});
        if(!transactionExisted) throw new NotFoundResponse('NotFound Transaction!');

        let formatTransaction = {}, message;
        if(is_cancel){
            if(transactionExisted.is_cancel)
                throw new BadRequestResponse('This transaction has been cancelled!');

            formatTransaction = { is_cancel }
            message = 'Cancel Transaction Successfully!'
        } else {
            if(!transactionExisted.is_cancel)
                throw new BadRequestResponse('This transaction has not been processed yet!');

            formatTransaction = { is_cancel }
            message = 'Uncancel Transaction Successfully!'
        }

        const result = await TransactionModel.update(formatTransaction, {
            where: { id: transaction_id }
        });
        await AdminHistoryService.addNew({
            admin_id: sub,
            action: is_cancel? 'delete': 'restore',
            model: 'transaction',
            data_input: JSON.stringify({ transaction_id, is_cancel }),
            init_value: transactionExisted as any,
            change_value: formatTransaction as any
        });

        return { result, message };
    }
}

export default AdminTransactionService;
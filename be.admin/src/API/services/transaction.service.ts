import { cast, Op } from "sequelize";
import TransactionModel from "../../models/transaction";
import { BadRequestResponse, NotFoundResponse } from "../core/ErrorResponse";
import User from "../../models/user";
import AdminHistoryService from "./admin.history.service";
import { TransactionStatus, TransactionType } from "~/type/app.entities";

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
            attributes: ['id', 'user_id', 'type', 'amount', 'status', 'createdAt'],
            order: [['id', 'DESC']],
            where: { user_id }
        });

        let totalIn = 0, totalOut = 0;
        result.rows.map(items => {
            if(items.type==='deposit' && items.status==='success'){
                totalOut += parseInt(items.amount as any);
            }
            if(items.type==='withdraw' && items.status==='success'){
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

    static getTransactions = async (
        sub: number, page: number, limit: number, user_id: number, type: string,
        status: string, min_value: number, max_value: number,
        amount: number, start_date: string, end_date: string
    ) => {
        const pageCurrent = Number.isNaN(page)? 1: page;
        const recordsOfPage = Number.isNaN(limit)? 10: limit;
        const offset = (pageCurrent-1)*recordsOfPage;

        let condition = {} as any;
        if(!Number.isNaN(user_id)) condition.user_id = user_id;
        if(type && (type===TransactionType.deposit || type===TransactionType.withdraw)) condition.type = type;
        if(status && (status===TransactionStatus.pending || status===TransactionStatus.success || status===TransactionStatus.cancel)) condition.status = status;
        if(!Number.isNaN(amount)) condition.value = amount;
        if(!Number.isNaN(min_value) && !Number.isNaN(max_value)){
            if(min_value>max_value)
                throw new BadRequestResponse('Param min/max_value in query invalid!');

            condition.amount = { [Op.between]: [cast(min_value, 'DECIMAL(10, 2)'), cast(max_value, 'DECIMAL(10, 2)')] };
        } else if (!Number.isNaN(min_value) && Number.isNaN(max_value)) {
            condition.amount = { [Op.gte]: cast(min_value, 'DECIMAL(10, 2)') };
        } else if (Number.isNaN(min_value) && !Number.isNaN(max_value)) {
            condition.amount = { [Op.lte]: cast(max_value, 'DECIMAL(10, 2)') }
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
            attributes: ['id', 'user_id', 'type', 'amount', 'status', 'createdAt', 'updatedAt'],
            include: [
                {
                    model: User,
                    as: 'users',
                    attributes: ['id', 'fullname', 'username', 'avatar', 'role', 'balance', 'phone'],
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
            status: 'pending'
        }});
        if(!transactionExisted) throw new NotFoundResponse('NotFound This Transaction!');

        const formatTransaction = {
            status: 'success' as TransactionStatus
        }
        const result = await TransactionModel.update(formatTransaction, {
            where: { id: transaction_id }
        });

        await AdminHistoryService.addNew({
            admin_id: sub,
            action: `Phê duyệt yêu cầu giao dịch ${transaction_id}`,
        });

        const infoUser = await User.findByPk(transactionExisted.user_id);
        if(transactionExisted.type==='deposit'){
            const updateCoin = parseInt(infoUser!.balance as any) + parseInt(transactionExisted.amount as any);
            await User.update(
                { balance: updateCoin },
                { where: { id: transactionExisted.user_id } }
            );
        }
        if(transactionExisted.type==='withdraw'){
            const updateCoin = parseInt(infoUser!.balance as any) - parseInt(transactionExisted.amount as any);
            await User.update(
                { balance: updateCoin },
                { where: { id: transactionExisted.user_id } }
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
            status: 'pending'
        }});
        if(!transactionExisted) throw new NotFoundResponse('NotFound Transaction!');

        let formatTransaction = {}, message;
        if(is_cancel){
            if(transactionExisted.status==='cancel')
                throw new BadRequestResponse('This transaction has been cancelled!');

            formatTransaction = { status: 'cancel' }
            message = 'Cancel Transaction Successfully!'
        } else {
            if(transactionExisted.status!=='cancel')
                throw new BadRequestResponse('This transaction has not been processed yet!');

            formatTransaction = { status: 'pending' }
            message = 'Uncancel Transaction Successfully!'
        }

        const result = await TransactionModel.update(formatTransaction, {
            where: { id: transaction_id }
        });
        await AdminHistoryService.addNew({
            admin_id: sub,
            action: `${is_cancel? 'Hủy': 'Khôi phục'} yêu cầu giao dịch ${transaction_id}`,
        });

        return { result, message };
    }
}

export default AdminTransactionService;
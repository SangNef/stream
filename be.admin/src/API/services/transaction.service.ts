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
            throw new BadRequestResponse('ID người dùng không hợp lệ!');

        const userExisted = await User.findByPk(user_id);
        if(!userExisted) throw new NotFoundResponse('Người dùng không tồn tại!');

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
                throw new BadRequestResponse('Tham số min/max_value không chính xác!');

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

    static toggleTransaction = async (transaction_id: number, sub: number, status: string) => {
        if(Number.isNaN(transaction_id))
            throw new BadRequestResponse('ID Giao dịch không hợp lệ!');

        if(
            (!status || typeof(status)!=='string' || status.trim()==='') ||
            (status!=='pending' && status!=='success' && status!=='cancel')
        ) throw new BadRequestResponse('Trạng thái giao dịch không hợp lệ!');

        let result = 0 as any, message = "";
        if(status==='success'){
            const transactionExisted = await TransactionModel.findOne({ where: {
                id: transaction_id,
                status: 'pending'
            }});
            if(!transactionExisted) throw new NotFoundResponse('Không tìm thấy giao dịch chờ phê duyệt!');

            const formatTransaction = {
                status: 'success' as TransactionStatus
            }
            result = await TransactionModel.update(formatTransaction, {
                where: { id: transaction_id }
            });
            message = "Phê duyệt yêu cầu giao dịch thành công!";

            await AdminHistoryService.addNew({
                admin_id: sub,
                action: `Phê duyệt yêu cầu giao dịch ${transaction_id}`,
            });

            // Tự động tính số dư tài khoản sau giao dịch.
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
        } else if (status==='cancel') {
            const transactionExisted = await TransactionModel.findOne({ where: {
                id: transaction_id,
                status: 'pending'
            }});
            if(!transactionExisted) throw new NotFoundResponse('Không tìm thấy giao dịch chờ phê duyệt!');

            const formatTransaction = {
                status: 'cancel' as TransactionStatus
            }
            result = await TransactionModel.update(formatTransaction, { where: {
                id: transaction_id
            }});
            message = "Hủy bỏ yêu cầu giao dịch thành công!";
        } else {
            const transactionExisted = await TransactionModel.findOne({ where: {
                id: transaction_id,
                status: 'cancel'
            }});
            if(!transactionExisted) throw new NotFoundResponse('Giao dịch bị hủy không tồn tại!');

            const formatTransaction = {
                status: 'pending' as TransactionStatus
            }
            result = await TransactionModel.update(formatTransaction, { where: {
                id: transaction_id
            }});
            message = "Khôi phục yêu cầu giao dịch thành công!";
        }

        return { result, message };
    }
}

export default AdminTransactionService;
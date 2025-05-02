import { Request, Response } from "express";
import { OK } from "../core/SuccessResponse";
import { AdminTransactionService } from "../services";
import { ReqEntity } from "../../type/app.entities";

class AdminTransactionController {
    static getHistoryTransaction = async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);
        const user_id = parseInt(req.params.user_id);

        const result = await AdminTransactionService.getHistoryTransachtion(page, limit, user_id);
        return new OK({
            metadata: result,
            message: 'Lấy lịch sử giao dịch theo người dùng thành công!'
        }).send(res);
    }

    static getTransactions = async (req: ReqEntity, res: Response) => {
        const sub = req.user?.sub;
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);
        const user_id = parseInt(req.query.user_id as string);
        const type = req.query.type as string;
        const status = req.query.status as string;
        const amount = parseInt(req.query.amount as string);
        const min_value = parseInt(req.query.min_value as string);
        const max_value = parseInt(req.query.max_value as string);
        const start_date = req.query.start_date as string;
        const end_date = req.query.end_date as string;

        const result = await AdminTransactionService.getTransactions(sub, page, limit, user_id, type, status, min_value, max_value, amount, start_date, end_date);
        return new OK({
            metadata: result,
            message: 'Lấy danh sách lịch sử giao dịch thành công!'
        }).send(res);
    }

    static toggleTransaction = async (req: ReqEntity, res: Response) => {
        const sub = req.user.sub;
        const transactionId = parseInt(req.params.transaction_id);
        const status = req.body.status;

        const result = await AdminTransactionService.toggleTransaction(transactionId, sub, status);
        return new OK({
            metadata: result.result,
            message: result.message
        }).send(res);
    }
}

export default AdminTransactionController;
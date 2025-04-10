import { Request, Response } from "express";
import { OK } from "../core/SuccessResponse";
import { AdminTransactionService } from "../services";
import { ReqEntity } from "../../type/app.entities";
import { stringToBoolean } from "../helpers/function";

class AdminTransactionController {
    static getHistoryTransaction = async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);
        const user_id = parseInt(req.params.user_id);

        const result = await AdminTransactionService.getHistoryTransachtion(page, limit, user_id);
        return new OK({
            metadata: result,
            message: 'Lấy lịch sử giao dịch thành công!'
        }).send(res);
    }

    static getTransactions = async (req: ReqEntity, res: Response) => {
        const sub = req.user?.sub;
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);
        const implementer = (req.query.implementer==='null' || req.query.implementer===null)? null: parseInt(req.query.implementer as string);
        const receiver = parseInt(req.query.receiver as string);
        const type = req.query.type as string;
        const is_all = stringToBoolean(req.query.is_all as string);
        const is_success = stringToBoolean(req.query.is_success as string);
        const is_cancel = stringToBoolean(req.query.is_cancel as string);
        const value = parseInt(req.query.value as string);
        const min_value = parseInt(req.query.min_value as string);
        const max_value = parseInt(req.query.max_value as string);
        const start_date = req.query.start_date as string;
        const end_date = req.query.end_date as string;

        const result = await AdminTransactionService.getTransactions(sub, page, limit, implementer, receiver, type, is_all, is_success, is_cancel, min_value, max_value, value, start_date, end_date);
        return new OK({
            metadata: result,
            message: 'Get Transactions Successfully!'
        }).send(res);
    }

    static submitTransaction = async (req: ReqEntity, res: Response) => {
        const transaction_id = parseInt(req.params.transaction_id);
        const sub = req.user?.sub;
        
        const result = await AdminTransactionService.submitTransaction(transaction_id, sub);
        return new OK({
            metadata: result,
            message: 'Submit Transaction Successfully!'
        }).send(res);
    }

    static cancelTransaction = async (req: ReqEntity, res: Response) => {
        const transaction_id = parseInt(req.params.transaction_id);
        const is_cancel = stringToBoolean(req.query.is_cancel as string);
        const sub = req.user?.sub;

        const result = await AdminTransactionService.cancelTransaction(transaction_id, is_cancel, sub);
        return new OK({
            metadata: result.result,
            message: result.message
        }).send(res);
    }
}

export default AdminTransactionController;
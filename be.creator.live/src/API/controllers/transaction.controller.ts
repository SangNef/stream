import { ReqEntity } from "~/type/app.entities";
import { CREATED, OK } from "../core/SuccessResponse";
import { UserTransactionService } from "../services";
import { Response } from "express";

class UserTransactionController {
    static getUsersDonated = async (req: ReqEntity, res: Response) => {
        const sub = req.user?.sub;
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);
        const search = req.query.search as string;

        const result = await UserTransactionService.getListInfoUserDonated(sub, page, limit, search);
        return new OK({
            metadata: result,
            message: 'Get List Donate Successfully!'
        }).send(res);
    }

    static getHistoryTransaction = async (req: ReqEntity, res: Response) => {
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);
        const user_id = req.user?.sub;

        const result = await UserTransactionService.getHistoryTransachtion(page, limit, user_id);
        return new OK({
            metadata: result,
            message: 'Lấy lịch sử giao dịch thành công!'
        }).send(res);
    }

    static addNew = async (req: ReqEntity, res: Response) => {
        const sub = req.user?.sub;
        const type = req.body.type;
        const value = parseInt(req.body.value);
        const content = req.body.content;

        const result = await UserTransactionService.addNew(sub, type, value, content);
        return new CREATED({
            metadata: result,
            message: 'Your Request Is Pending Approval!'
        }).send(res);
    }
}

export default UserTransactionController;
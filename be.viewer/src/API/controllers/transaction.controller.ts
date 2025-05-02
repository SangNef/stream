import { Response } from "express";
import { CREATED, OK } from "../core/SuccessResponse";
import { UserTransactionService } from "../services";
import { ReqEntity } from "../../type/app.entities";

class UserTransactionController {
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

        const result = await UserTransactionService.addNew(sub, type, value);
        return new CREATED({
            metadata: result,
            message: 'Yêu cầu giao dịch của bạn đang chờ phê duyệt!'
        }).send(res);
    }
}

export default UserTransactionController;
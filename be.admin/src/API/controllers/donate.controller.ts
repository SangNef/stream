import { Request, Response } from "express";
import { stringToBoolean } from "../helpers/function";
import { AdminDonateService } from "../services";
import { OK } from "../core/SuccessResponse";

class AdminDonateController {
    static getDonate = async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);
        const filter = {
            user_id: parseInt(req.query.user_id as string),
            item_id: parseInt(req.query.item_id as string),
            stream_id: parseInt(req.query.stream_id as string),
            amount: parseInt(req.query.amount as string),
            min_amount: parseInt(req.query.min_amount as string),
            max_amount: parseInt(req.query.max_amount as string),
            is_paranoid: !stringToBoolean(req.query.is_paranoid as string)
        }

        const result = await AdminDonateService.getDonates(page, limit, filter);
        return new OK({
            metadata: result,
            message: "Lấy danh sách donate thành công!"
        }).send(res);
    }
}

export default AdminDonateController;
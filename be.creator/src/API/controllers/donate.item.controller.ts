import { Request, Response } from "express";
import { stringToBoolean } from "../helpers/function";
import { UserDonateItemService } from "../services";
import { OK } from "../core/SuccessResponse";

class UserDonateItemController {
    static getList = async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);
        const filter = {
            name: req.query.name as string,
            price: parseInt(req.query.price as string),
            min_price: parseInt(req.query.min_price as string),
            max_price: parseInt(req.query.max_price as string)
        }
        const is_paranoid = !stringToBoolean(req.query.is_paranoid as string);

        const result = await UserDonateItemService.getList(page, limit, filter, is_paranoid);
        return new OK({
            metadata: result,
            message: 'Lấy danh sách vật phẩm quà tặng thành công!'
        }).send(res);
    }
}

export default UserDonateItemController;
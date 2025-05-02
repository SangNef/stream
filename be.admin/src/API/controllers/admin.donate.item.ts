import { Request, Response } from "express";
import { AdminDonateItemService, AdminHistoryService } from "../services";
import { CREATED, OK } from "../core/SuccessResponse";
import { stringToBoolean } from "../helpers/function";

class AdminDonateItemController {
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

        const result = await AdminDonateItemService.getList(page, limit, filter, is_paranoid);
        return new OK({
            metadata: result,
            message: 'Lấy danh sách vật phẩm quà tặng thành công!'
        }).send(res);
    }

    static addNew = async (req: Request, res: Response) => {
        const result = await AdminDonateItemService.addNew(req.body);
        await AdminHistoryService.addNew({
            admin_id: req.user?.sub!,
            action: `Thêm mới vật phẩm quà tặng ${result.id}`
        });
        return new CREATED({
            metadata: result,
            message: 'Thêm mới vật phẩm quà tặng thành công!'
        }).send(res);
    }

    static update = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const result = await AdminDonateItemService.update(id, req.body);
        await AdminHistoryService.addNew({
            admin_id: req.user?.sub!,
            action: `Cập nhật thông tin vật phẩm quà tặng ${id}`
        });
        return new OK({
            metadata: result,
            message: 'Cập nhật vật phẩm quà tặng thành công!'
        }).send(res);
    }

    static delOrRestore = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const is_delete = stringToBoolean(req.query.is_delete as string);
        const result = await AdminDonateItemService.delOrRestore(id, is_delete);
        await AdminHistoryService.addNew({
            admin_id: req.user?.sub!,
            action: `${result.message.includes('Xóa')? 'Xóa': 'Khôi phục'} vật phẩm quà tặng ${id}`
        });
        return new OK({
            metadata: result.result,
            message: result.message
        }).send(res);
    }
}

export default AdminDonateItemController;
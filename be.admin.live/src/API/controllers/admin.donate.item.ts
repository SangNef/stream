import { Request, Response } from "express";
import { AdminDonateItemService } from "../services";
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
            message: 'Get Donate Items Successfully!'
        }).send(res);
    }

    static addNew = async (req: Request, res: Response) => {
        const result = await AdminDonateItemService.addNew(req.body);
        return new CREATED({
            metadata: result,
            message: 'Created Donate Item Successfully!'
        }).send(res);
    }

    static update = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const result = await AdminDonateItemService.update(id, req.body);
        return new OK({
            metadata: result,
            message: 'Updated Donate Item Sucessfully!'
        }).send(res);
    }

    static delOrRestore = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const is_delete = stringToBoolean(req.query.is_delete as string);
        const result = await AdminDonateItemService.delOrRestore(id, is_delete);
        return new OK({
            metadata: result.result,
            message: result.message
        }).send(res);
    }
}

export default AdminDonateItemController;
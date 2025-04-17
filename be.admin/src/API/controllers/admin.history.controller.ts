import { Request,Response } from "express";
import { OK } from "../core/SuccessResponse";
import { AdminHistoryService } from "../services";

class AdminHistoryController {
    static getHistories = async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);
        const admin_id = parseInt(req.query.admin_id as string);
        const action = req.query.action as string;
        const model = req.query.model as string;
        const start_date = req.query.start_date as string;
        const end_date = req.query.end_date as string;

        const result = await AdminHistoryService.getHistories(page, limit, admin_id, action, model, start_date, end_date);
        return new OK({
            metadata: result,
            message: 'Get Histories Successfully!'
        }).send(res);
    }
}

export default AdminHistoryController;
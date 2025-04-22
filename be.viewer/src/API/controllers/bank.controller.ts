import { Response } from "express";
import { ReqEntity } from "~/type/app.entities";
import { UserBankService } from "../services";
import { CREATED, OK } from "../core/SuccessResponse";

class UserBankController {
    static getBanks = async (req: ReqEntity, res: Response) => {
        const sub = req.user.sub;
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);
        const bank_name = req.query.bank_name as string;

        const result = await UserBankService.getBanks(sub, page, limit, bank_name);
        return new OK({
            metadata: result,
            message: 'Get Banks Successfully!'
        }).send(res);
    }

    static addNew = async (req: ReqEntity, res: Response) => {
        const data = {
            user_id: req.user.sub,
            bank_name: req.body.bank_name,
            bank_account: req.body.bank_account,
            bank_username: req.body.bank_username
        }

        const result = await UserBankService.addNew(data);
        return new CREATED({
            metadata: result,
            message: 'Add New Info Bank Successfully!'
        }).send(res);
    }

    static delBank = async (req: ReqEntity, res: Response) => {
        const sub = req.user.sub;
        const bank_id = parseInt(req.params.bank_id);
        const result = await UserBankService.delBank(sub, bank_id);
        return new OK({
            metadata: result,
            message: 'Deleted Bank Successfully!'
        }).send(res);
    }
}

export default UserBankController;
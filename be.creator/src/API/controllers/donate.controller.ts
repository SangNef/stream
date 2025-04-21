import { Response } from "express";
import { ReqEntity } from "~/type/app.entities";
import { UserDonateService } from "../services";
import { OK } from "../core/SuccessResponse";

class UserDonateController {
    static getListInfoUserDonated = async (req: ReqEntity, res: Response) => {
        const sub = req.user.sub;
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);
        const search = req.query.search as string;

        const result = await UserDonateService.getListInfoUserDonated(sub, page, limit, search);
        return new OK({
            metadata: result,
            message: 'Get List Info User Donated Successfully!'
        }).send(res);
    }
}

export default UserDonateController;
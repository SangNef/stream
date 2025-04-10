import { Response } from "express";
import { CREATED, OK } from "../core/SuccessResponse";
import { UserFavouriteService } from "../services";
import { ReqEntity } from "../../type/app.entities";

class UserFavouriteController {
    static getListStreamFavourite = async (req: ReqEntity, res: Response) => {
        const userid = req.user.sub;
        const result = await UserFavouriteService.getListStreamFavourite(userid);
        return new OK({
            metadata: result,
            message: "Get List Stream Favourite Successfully!"
        }).send(res);
    }

    static addNew = async (req: ReqEntity, res: Response) => {
        const dataBody = req.body;
        const data = dataBody.user_id? dataBody: {
            ...dataBody,
            user_id: req.user.sub
        }
        const result = await UserFavouriteService.addNewFavourite(data);
        return new CREATED({
            metadata: result,
            message: "Added New Stream Favourite Successfully!"
        }).send(res);
    }

    static unfavorite = async (req: ReqEntity, res: Response) => {
        const data = {
            id: parseInt(req.params.id),
            user_id: req.user.sub
        }
        const result = await UserFavouriteService.unfavourite(data);
        return new OK({
            metadata: result,
            message: "Favorite stream has been successfully canceled!"
        }).send(res);
    }
}

export default UserFavouriteController;
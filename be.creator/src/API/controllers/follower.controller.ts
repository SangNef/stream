import { ReqEntity } from "~/type/app.entities";
import { CREATED, OK } from "../core/SuccessResponse";
import { UserFollowerServie } from "../services";
import { Response } from "express";

class UserFollowerController {
    static getListStreamInfo = async (req: ReqEntity, res: Response) => {
        const user_id = req.user.sub;
        const result = await UserFollowerServie.getStreamInfoOfCreatorFollowed(user_id);
        return new OK({
            metadata: result,
            message: "Get list of successful stream information!"
        }).send(res);
    }

    static getInfoListCreatorFollowed = async (req: ReqEntity, res: Response) => {
        const sub = req.user.sub;
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);
        const result = await UserFollowerServie.getInfoListCreatorFollowed(sub, page, limit);
        return new OK({
            metadata: result,
            message: "Get Info List Creator Followed Successfully!"
        }).send(res);
    }

    static addNewFollow = async (req: ReqEntity, res: Response) => {
        const data = {
            user_id: req.user.sub,
            creator_id: parseInt(req.params.creator_id)
        }
        const result = await UserFollowerServie.followCreator(data);
        return new CREATED({ metadata: result, message: "Followed Successfully!"}).send(res);
    }

    static unfollow = async (req: ReqEntity, res: Response) => {
        const data = {
            user_id: req.user.sub,
            creator_id: parseInt(req.params.creator_id)
        }
        const result = await UserFollowerServie.unfollowCreator(data);
        return new OK({ metadata: result, message: "Unfollowed Successfully!"}).send(res);
    }
}

export default UserFollowerController;
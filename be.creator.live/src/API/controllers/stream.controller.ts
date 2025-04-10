import { Request, Response } from "express";
import { CREATED, OK } from "../core/SuccessResponse";
import { UserStreamService } from "../services";
import { ReqEntity } from "~/type/app.entities";
import { stringToBoolean } from "../helpers/function";

class UserStreamController {
    static getStreamsHot = async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);
        const is_streaming = stringToBoolean(req.query.is_streaming as string);
        const result = await UserStreamService.getStreamsHot(page, limit, is_streaming);
        return new OK({
            metadata: result,
            message: "Get list of successfull stream hot!"
        }).send(res);
    }

    static getCreatorHot = async (req: Request, res: Response) => {
        const date = req.params.date;
        const result = await UserStreamService.getCreatorHot(date);
        return new OK({
            metadata: result,
            message: "Get list of successful creator hot!"
        }).send(res);
    }

    static getAllStreamBySub = async (req: ReqEntity, res: Response) => {
        const sub = req.user.sub;
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);
        
        const result = await UserStreamService.getAllStreamBySub(sub, page, limit);
        return new OK({
            metadata: result,
            message: "Get list of successful your stream!"
        }).send(res);
    }

    static getStreamById = async (req: ReqEntity, res: Response) => {
        const id = parseInt(req.params.streamid);
        const sub = req.user.sub;
        
        const result = await UserStreamService.getStreamById(id, sub);
        return new OK({
            metadata: result,
            message: "Get Info Stream Successfully!"
        }).send(res);
    }

    static getStreamUrlByCreatorId = async (req: Request, res: Response) => {
        const creator_id = req.params.creator_id;
        const result = await UserStreamService.getStreamUrlByCreatorId(parseInt(creator_id));
        return new OK({
            metadata: result as any,
            message: "Get Stream Url Successfully!"
        }).send(res);
    }

    static getListStreamOfCreatorFollowed = async (req: ReqEntity, res: Response) => {
        const sub = req.user.sub;
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);
        const result = await UserStreamService.getListStreamOfCreatorFollowed(sub, page, limit);
        return new OK({
            metadata: result,
            message: "Get List Stream Of Creator Followed Successfully!"
        }).send(res);
    }

    static createStream = async (req: ReqEntity, res: Response) => {
        const dataBody = req.body;
        const dataBodyAddTime = {
            ...dataBody,
            start_time: new Date()
        }
        const data = dataBodyAddTime.user_id? dataBodyAddTime: {
            ...dataBodyAddTime,
            user_id: req.user.sub
        }
        
        const result = await UserStreamService.createStream(data);
        return new CREATED({ metadata: result, message: "Created Successfully!"}).send(res);
    }

    static updateStream = async (req: Request, res: Response) => {
        const data = req.body;
        const id = parseInt(req.params.streamid);
        const result = await UserStreamService.updateStream(id, data);
        return new OK({ metadata: result, message: "Updated Successfully!"}).send(res);
    }
}

export default UserStreamController;
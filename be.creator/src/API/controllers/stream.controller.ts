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
            message: "Lấy danh sách livestream HOT thành công!"
        }).send(res);
    }

    static getCreatorHot = async (req: Request, res: Response) => {
        const date = req.params.date;
        const result = await UserStreamService.getCreatorHot(date);
        return new OK({
            metadata: result,
            message: "Lấy danh sách nhà sáng tạo nội dung HOT thành công!"
        }).send(res);
    }

    static getAllStreamBySub = async (req: ReqEntity, res: Response) => {
        const sub = req.user.sub;
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);
        
        const result = await UserStreamService.getAllStreamBySub(sub, page, limit);
        return new OK({
            metadata: result,
            message: "Lấy danh sách stream của bạn thành công!"
        }).send(res);
    }

    static getStreamById = async (req: ReqEntity, res: Response) => {
        const id = parseInt(req.params.streamid);
        const sub = req.user.sub;
        
        const result = await UserStreamService.getStreamById(id, sub);
        return new OK({
            metadata: result,
            message: "Lấy thông tin stream thành công!"
        }).send(res);
    }

    static getStreamUrlByCreatorId = async (req: Request, res: Response) => {
        const creator_id = req.params.creator_id;
        const result = await UserStreamService.getStreamUrlByCreatorId(parseInt(creator_id));
        return new OK({
            metadata: result as any,
            message: "Lấy đường dẫn đến livestream của nhà sáng tạo thành công!"
        }).send(res);
    }

    static getListStreamOfCreatorFollowed = async (req: ReqEntity, res: Response) => {
        const sub = req.user.sub;
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);
        const result = await UserStreamService.getListStreamOfCreatorFollowed(sub, page, limit);
        return new OK({
            metadata: result,
            message: "Lấy danh sách livestream của nhà sáng tạo đã theo dõi thành công!"
        }).send(res);
    }

    static statisticalByTime = async (req: ReqEntity, res: Response) => {
        const sub = req.user.sub;
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);
        const result = await UserStreamService.statisticalByTime(sub, page, limit, req.query);
        return new OK({
            metadata: result,
            message: 'Lấy thống kê stream theo khoảng thời gian thành công!'
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
        return new CREATED({ metadata: result, message: "Tạo livestream thành công!"}).send(res);
    }

    static updateStream = async (req: Request, res: Response) => {
        const data = req.body;
        const id = parseInt(req.params.streamid);
        const result = await UserStreamService.updateStream(id, data);
        return new OK({ metadata: result, message: "Cập nhật livestream thành công!"}).send(res);
    }
}

export default UserStreamController;
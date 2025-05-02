import { Request, Response } from "express";
import { OK } from "../core/SuccessResponse";
import { AdminStreamService } from "../services";
import { ReqEntity } from "~/type/app.entities";

class AdminStreamController {
    static getStreams = async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string);
        const search = req.query.search as string;
        const limit = parseInt(req.query.limit as string);
        const status = req.query.status as string;

        const result = await AdminStreamService.getStreams(page, limit, search, status);
        return new OK({
            metadata: result,
            message: "Lấy danh sách stream thành công!"
        }).send(res);
    }

    static getStreamsByCreatorID = async (req: Request, res: Response) => {
        const creator_id = parseInt(req.params.creator_id);
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);

        const result = await AdminStreamService.getAllStreamBySub(creator_id, page, limit);
        return new OK({
            metadata: result,
            message: "Lấy danh sách stream theo nhà sáng tạo thành công!"
        }).send(res);
    }

    static stopLivestream = async (req: ReqEntity, res: Response) => {
        const streamid = req.params.stream_id;
        const result = await AdminStreamService.stopLiveStream(parseInt(streamid), req.user?.sub);
        return new OK({
            metadata: result,
            message: "Dừng livestream thành công!"
        }).send(res);
    }
}

export default AdminStreamController;
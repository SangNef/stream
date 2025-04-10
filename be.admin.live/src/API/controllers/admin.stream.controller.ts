import { Request, Response } from "express";
import { OK } from "../core/SuccessResponse";
import { AdminStreamService } from "../services";
import { ReqEntity } from "~/type/app.entities";

class AdminStreamController {
    static getAllStreamLiving = async (req: Request, res: Response) => {
        const page = req.query.page as string;
        const search = req.query.search as string;
        const limit = req.query.limit as string;

        const result = await AdminStreamService.getAllStreamLiving(parseInt(page), parseInt(limit), search);
        return new OK({
            metadata: result,
            message: "Get list of successful stream living!"
        }).send(res);
    }
    static getAllStreamStop = async (req: Request, res: Response) => {
        const page = req.query.page as string;
        const search = req.query.search as string;
        const limit = req.query.limit as string;

        const result = await AdminStreamService.getAllStreamStop(parseInt(page), parseInt(limit), search);
        return new OK({
            metadata: result,
            message: "Get list of successful stream stop!"
        }).send(res);
    }

    static getStreamsByCreatorID = async (req: Request, res: Response) => {
        const creator_id = parseInt(req.params.creator_id);
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);

        const result = await AdminStreamService.getAllStreamBySub(creator_id, page, limit);
        return new OK({
            metadata: result,
            message: "Get Streams Successfully!"
        }).send(res);
    }

    static stopLivestream = async (req: ReqEntity, res: Response) => {
        const streamid = req.params.stream_id;
        const result = await AdminStreamService.stopLiveStream(parseInt(streamid), req.user?.sub);
        return new OK({
            metadata: result,
            message: "Stoped Livestream Successfully!"
        }).send(res);
    }
}

export default AdminStreamController;
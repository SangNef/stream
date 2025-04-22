// import { Request, Response } from "express";
// import { OK } from "../core/SuccessResponse";
// import { UserCommentService } from "../services";

// class UserCommentController {
//     static getComments = async (req: Request, res: Response) => {
//         const page = parseInt(req.query.limit as string);
//         const limit = parseInt(req.query.limit as string);
//         const stream_id = parseInt(req.params.stream_id);
//         const result = await UserCommentService.getComments(page, limit, stream_id);
//         return new OK({
//             metadata: result,
//             message: 'Get Comments Successfully!'
//         }).send(res);
//     }
// }

// export default UserCommentController;
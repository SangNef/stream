import { CREATED, OK } from "../core/SuccessResponse";
import { AdminHistoryService, AdminService } from "../services";
import { stringToBoolean } from "../helpers/function";
import { ReqEntity } from "../../type/app.entities";
import { Request, Response } from "express";

class AdminController {
    static getListAdmin = async (req: ReqEntity, res: Response) => {
        const search = req.query.search as string;
        const page = req.query.page as string;
        const limit = req.query.limit as string;
        const is_paranoid = !stringToBoolean(req.query.is_paranoid as string);
        const sub = req?.user?.sub;
        
        const result = await AdminService.getListAdmin(search, parseInt(page), parseInt(limit), is_paranoid, sub);
        return new OK({
            metadata: result,
            message: "Lấy danh sách quản trị viên thành công!"
        }).send(res);
    }

    static getListUser = async (req: Request, res: Response) => {
        const search = req.query.search as string;
        const period = req.query.period as string;
        const limit = req.query.limit as string;
        const page = req.query.page as string;
        const isParanoid = !stringToBoolean(req.query.is_paranoid as string)

        const result = await AdminService.getListRoleUser(search, period, parseInt(limit), parseInt(page), isParanoid);
        return new OK({
            metadata: result,
            message: "Lấy danh sách người dùng thành công!"
        }).send(res);
    }

    static getListCreator = async (req: Request, res: Response) => {
        const search = req.query.search as string;
        const period = req.query.period as string;
        const recordsLimit = req.query.limit as string;
        const page = req.query.page as string;
        const is_paranoid = !stringToBoolean(req.query.is_paranoid as string);

        const result = await AdminService.getListRoleCreator(search, period, parseInt(recordsLimit), parseInt(page), is_paranoid);
        return new OK({
            metadata: result,
            message: "Lấy danh sách nhà sáng tạo thành công!"
        }).send(res);
    }

    static signin = async (req: Request, res: Response) => {
        const data = req.body;

        const result = await AdminService.signin(data);
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: true,
            path: "/",
            sameSite: "strict",
        });
        const { refreshToken, ...newResult } = result;

        return new OK({ metadata: newResult, message: "Đăng nhập thành công!"}).send(res);
    }

    static signup = async (req: ReqEntity, res: Response) => {
        const data = req.body;

        const result = await AdminService.signup(req.user.sub, data);
        await AdminHistoryService.addNew({
            admin_id: req.user?.sub,
            action: `Thêm mới tài khoản quản trị viên. Dữ liệu vào: ${JSON.stringify(data)}`
        });
        return new CREATED({
            metadata: result,
            message: "Tạo tài khoản admin mới thành công!"
        }).send(res);
    }

    static createNewUserAccount = async (req: ReqEntity, res: Response) => {
        const sub = req.user.sub;
        const data = req.body;

        const result = await AdminService.createUserAccount(sub, data);
        await AdminHistoryService.addNew({
            admin_id: req.user?.sub,
            action: `Thêm mới tài khoản người dùng. Dữ liệu vào: ${JSON.stringify(data)}`
        });
        return new CREATED({
            metadata: result,
            message: "Thêm mới tài khoản nhà sáng tạo thành công!"
        }).send(res);
    }

    static updateUserAccount = async (req: ReqEntity, res: Response) => {
        const user_id = parseInt(req.params.user_id);
        const data = req.body;
        const sub = req.user?.sub;

        const result = await AdminService.updateUserAccount(user_id, data, sub);
        return new OK({
            metadata: result,
            message: 'Cập nhật thông tin tài khoản người dùng thành công!'
        }).send(res);
    }

    static updateAdminAccount = async (req: ReqEntity, res: Response) => {
        const sub = req.user?.sub;
        const user_id = parseInt(req.query.user_id as string);
        const data = req.body;

        const result = await AdminService.updateAdminAccount(sub, user_id, data);
        return new OK({
            metadata: result,
            message: 'Cập nhật tài khoản quản trị viên thành công!'
        }).send(res);
    }

    static softDeleteUser = async (req: ReqEntity, res: Response) => {
        const id = req.params.id;
        const isDelete = stringToBoolean(req.query.is_delete as string);
        const sub = req.user?.sub;
        
        const result = await AdminService.softDeleteUserAccount(parseInt(id), isDelete, sub);
        return new OK({
            metadata: result.result as any,
            message: result.message
        }).send(res);
    }

    static softDeleteAdmin = async (req: ReqEntity, res: Response) => {
        const id = req.params.id;
        const is_delete = stringToBoolean(req.query.is_delete as string);
        const sub = req.user?.sub;

        const result = await AdminService.softDeleteAdminAccount(parseInt(id), is_delete, sub);
        return new OK({
            metadata: result.result as any,
            message: result.message
        }).send(res);
    }
}

export default AdminController;
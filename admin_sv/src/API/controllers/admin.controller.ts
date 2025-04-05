import { Request, Response } from "express";
import { OK } from "../core/success.response";
import { AccountService, AuthService } from "../services";

class AdminController {
    static login = async (req: Request, res: Response) => {
        const result = await AuthService.login(req.body);
        res.cookie("refreshToken", result.refreshToken, { httpOnly: true, path: "/", sameSite: "strict", secure: process.env.NODE_ENV === "production" });
        new OK({ message: "Đăng nhập thành công", metadata: result.accessToken }).send(res);
    };

    static refreshToken = async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        const result = await AuthService.refreshToken(refreshToken);
        new OK({ message: "Lấy token mới thành công", metadata: result.accessToken }).send(res);
    }

    static getProfile = async (req: Request, res: Response): Promise<void> => {

        const sub = req.user?.id;

        if (!sub) {
            res.status(400).json({ message: "Không tìm thấy thông tin người dùng", code: 9 });
            return;
        }

        const result = await AccountService.getProfile(sub);

        new OK({
            message: "Lấy thông tin thành công",
            metadata: result
        }).send(res);
        return;
    };

    static updateProfile = async (req: Request, res: Response): Promise<void> => {
        
        const sub = req.user?.id;

        if (!sub) {
            res.status(400).json({ message: "Không tìm thấy thông tin người dùng", code: 9 });
            return;
        }

        const result = await AccountService.updateProfile(sub, req.body);

        new OK({
            message: "Cập nhật thông tin thành công",
            metadata: result
        }).send(res);
        return;
    };

}

export default AdminController;

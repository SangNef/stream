import { Request, Response } from "express";
import { CREATED, OK } from "../core/SuccessResponse";
import { UserAccountService } from "../services";
import AuthService from "../services/auth.service";
import { ReqEntity } from "~/type/app.entities";

class UserAccountController {
    static getListAcc = async (req: Request, res: Response) => {
        const roleAcc = req?.params.roleacc;
        const search = req?.params.search;
        const page = req?.params.page;
        const result = await UserAccountService.getListUserAcc(roleAcc, search, parseInt(page));
        return new OK({
            metadata: result,
            message: 'Get List Account Successfully!'
        }).send(res);
    }

    static getProfileByUserId = async (req: Request, res: Response) => {
        const user_id = parseInt(req.params.user_id);
        const result = await AuthService.getProfileBySub(user_id);
        return new OK({
            metadata: result as any,
            message: "Get Profile By User ID Successfully!"
        }).send(res);
    }

    static signin = async (req: Request, res: Response) => {
        const data = req.body;
        const result = await UserAccountService.signin(data);
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: true,
            path: "/",
            sameSite: "strict",
        });

        const { refreshToken, ...newResult } = result;
        return new OK({ metadata: newResult, message: "Login Successfully!"}).send(res);
    }

    static signup = async (req: Request, res: Response) => {
        const data = req.body;
        const result = await UserAccountService.signup(data);
        return new CREATED({ metadata: result, message: "Signup Successfully!"}).send(res);
    }

    static updateInfoAcc = async (req: ReqEntity, res: Response) => {
        const { id, avatar, ...body} = req.body;
        const data = {
            ...body,
            id: req.user.sub,
        }

        const result = await UserAccountService.updateAccount(data);
        return new OK({ metadata: result, message: "Updated Successfully!"}).send(res);
    }

    static deleteAccount = async (req: ReqEntity, res: Response) => {
        const sub = req.user.sub;
        const result = await UserAccountService.deleteAccount(sub);
        return new OK({ metadata: result, message: "Deleted Successfully!"}).send(res);
    }
}

export default UserAccountController;
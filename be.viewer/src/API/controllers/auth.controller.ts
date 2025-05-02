import { Request, Response } from "express";
import { CREATED, OK } from "../core/SuccessResponse";
import { AuthService } from "../services/index";
import { ReqEntity } from "../../type/app.entities";

class AuthController {
  static getProfile = async (req: ReqEntity, res: Response) => {
    const sub = req.user.sub;
    const result = await AuthService.getProfileBySub(sub);
    return new OK({
      metadata: result as any,
      message: "Lấy thông tin tài khoản của bạn thành công!"
    }).send(res);
  }

  static uploadNewImage = async (req: Request, res: Response) => {
    const files = req.files;
    const result = await AuthService.uploadImages(files);
    return new CREATED({
        metadata: result.success,
        message: 
        `${result.error.length} tệp lỗi: ${result.error}. ||||| ${result.success.length} tệp lỗi.`
    }).send(res);
  }

  static changePassword = async (req: ReqEntity, res: Response) => {
    const sub = req.user.sub;
    const role = req.user.role;
    const newPass = req.body.newpass;
    const code = req.body.code? req.body.code: req.body.oldpass;
    
    const result = await AuthService.changPassword(sub, role, newPass, code);
    return new OK({
      metadata: result,
      message: "Thay đổi mật khẩu tài khoản của bạn thành công!"
    }).send(res);
  }
}
export default AuthController;

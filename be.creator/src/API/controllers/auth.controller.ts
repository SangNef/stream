import { ReqEntity } from "~/type/app.entities";
import { CREATED, OK } from "../core/SuccessResponse";
import { AuthService } from "../services/index";
import { Request, Response } from "express";

class AuthController {
  static getProfile = async (req: ReqEntity, res: Response) => {
    const sub = req.user.sub;
    const result = await AuthService.getProfileBySub(sub);
    return new OK({
      metadata: result as any,
      message: "Get Your Profile Successfully!"
    }).send(res);
  }

  // static sendCodeToMail = async (req, res) => {
  //   const sub = req.user.sub;
  //   const role = req.user.role;
  //   const result = await AuthService.sendCodeToMail(sub, role);
  //   return new OK({
  //     metadata: result,
  //     message: "Sent Code To Your Email Successfully!"
  //   }).send(res);
  // }

  static uploadNewImage = async (req: Request, res: Response) => {
    const files = req.files;
    const result = await AuthService.uploadImages(files);
    return new CREATED({
        metadata: result.success,
        message: 
        `${result.error.length} files error: ${result.error}. ||||| ${result.success.length} files success.`
    }).send(res);
  }

  static changePassword = async (req: ReqEntity, res: Response) => {
    const sub = req.user.sub;
    const newPass = req.body.newpass;
    const code = req.body.code? req.body.code: req.body.oldpass;
    
    const result = await AuthService.changPassword(sub, newPass, code);
    return new OK({
      metadata: result,
      message: "Changed Your Password Successfully!"
    }).send(res);
  }
}
export default AuthController;

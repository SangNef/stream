import { BadRequestResponse, NotFoundResponse, Unauthorized } from "../core/ErrorResponse";
import { compare, hash } from "../helpers/bcrypt";
import { jwtSignAccessToken, jwtVerifyAccessToken } from "../helpers/jwt";
import * as dotenv from "dotenv";
import NodeCache from "node-cache";
import User from "../../models/user";
import Admin from "../../models/admin";
import { OK } from "../core/SuccessResponse";
import { Request, Response } from "express";

dotenv.config();

const cache = new NodeCache({ stdTTL: 120});

class AuthService {
  static providerRefreshToken = async (req: Request, res: Response) => {
    const tokenCookie = req.cookies;
    const refreshToken = tokenCookie.refreshToken;
    if(!refreshToken) throw new BadRequestResponse('Mã làm mới không xác định!');

    const payload = jwtVerifyAccessToken(refreshToken, process.env.JWT_SECRET_REFRESHTOKEN!)
    if(!payload) throw new BadRequestResponse('Mã làm mới không chính xác!');

    delete payload.exp;
    return res.status(200).json({ accessToken: jwtSignAccessToken(payload)});
  }

  static getProfileBySub = async (sub: number, role: string) => {
    if(role!=='admin') throw new NotFoundResponse('Không tìm thấy thông tin tài khoản!');

    let result;
    result = await Admin.findByPk(sub);
    return result;
  }

  // Tải ảnh mới lên hệ thống và trả về url của ảnh.
  static uploadImages = async (files: any) => {
    if(!files || !files.length || files.length===0) throw new BadRequestResponse("DataInput Invalid! xxx");

    const baseUrl = process.env.URL_IMG_IN_DB;
    let arrImageUrl: any[] = [], arrFileError: any[] = [];
    files.map((items: any) => {
      if(
          !items.filename.endsWith('.png') &&
          !items.filename.endsWith('.jpg') &&
          !items.filename.endsWith('.jpeg') &&
          !items.filename.endsWith('.webp')
      ){
          arrFileError.push(items.originalname);
      } else {
          const image_url = `${baseUrl}/${items.filename}`;
          arrImageUrl.push(image_url);
      }
    });
    return { success: arrImageUrl, error: arrFileError };
  }

  static changPassword = async (sub: number, role: string, newPass: string, code: string) => {
    if(!newPass || newPass.trim()==='') 
      throw new BadRequestResponse('Dữ liệu cập nhật mật khẩu không hợp lệ!')

    const infoAcc = await User.findByPk(sub);

    if(!await compare(code, infoAcc!.password)){
      throw new BadRequestResponse('Mật khẩu cũ không chính xác!')
    }

    const checkNewPass = await this.isNewPassword(sub, newPass, role);
    if(!checkNewPass) throw new BadRequestResponse('Mật khẩu mới không được giống mật khẩu cũ!');
    
    await Admin.update({
      password: await hash(newPass.trim())
    }, { where: { id: sub}});

    return new OK({ message: "Cập nhật mật khẩu thành công!"});
  }

  static verifyCode = (emailTo: string, code: string) => {
    const checkCode = cache.get(emailTo);
    if(checkCode && checkCode===code){
      return true;
    }
    return false;
  }

  // Kiểm tra mật khẩu mới có khác với mật khẩu cũ.
  static isNewPassword = async (sub: number, newPass: string, role: string) => {
    const infoAcc = await Admin.findByPk(sub);
      if(await(compare(newPass.trim(), infoAcc!.password))){
        return false;
      }
    return true;
  }
}
export default AuthService;

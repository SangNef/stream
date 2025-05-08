import { BadRequestResponse } from "../core/ErrorResponse";
import { compare, hash } from "../helpers/bcrypt";
import { jwtSignAccessToken, jwtVerifyAccessToken } from "../helpers/jwt";
import * as dotenv from "dotenv";
import User from "../../models/user";
import { literal } from "sequelize";
import { Request, Response } from "express";

dotenv.config();

class AuthService {
  static providerRefreshToken = async (req: Request, res: Response) => {
    const tokenCookie = req.cookies;
    const refreshToken = tokenCookie.refreshToken;
    if(!refreshToken) throw new BadRequestResponse('Dữ liệu truyền vào không hợp lệ!');

    const payload = jwtVerifyAccessToken(refreshToken, process.env.JWT_SECRET_REFRESHTOKEN!)
    if(!payload) throw new BadRequestResponse('Mã tạo mới không hợp lệ!');

    const { exp, iat, nbf, ...newPayload } = payload;
    return res.status(200).json({ accessToken: jwtSignAccessToken(newPayload)});
  }

  static getProfileBySub = async (sub: number) => {
    const result = await User.findOne({
      attributes: [
        'id', 'fullname', 'username', 'avatar', 'role', 'balance',
        [literal(`(SELECT COUNT(*) FROM followers WHERE followers.creator_id = User.id)`), 'totalFollower'],
        [literal(`(SELECT COUNT(*) FROM followers WHERE followers.user_id = User.id)`), 'totalFollowed']
      ],
      where: { id: sub}
    });
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

  static changPassword = async (sub: number, newPass: string, code: string) => {
    if(!newPass || newPass.trim()==='') 
      throw new BadRequestResponse('Dữ liệu truyền vào không hợp lệ!')

    const infoAcc = await User.findByPk(sub);

    if(!await compare(code, infoAcc!.password)){
      throw new BadRequestResponse('Mật khẩu cũ không chính xác!')
    }

    const checkNewPass = await this.isNewPassword(sub, newPass);
    if(!checkNewPass) throw new BadRequestResponse('Mật khẩu mới không được giống mật khẩu cũ!');
    
    const result = await User.update({
      password: await hash(newPass.trim())
    }, { where: { id: sub}});

    return result;
  }

  // Kiểm tra mật khẩu mới có khác với mật khẩu cũ.
  static isNewPassword = async (sub: number, newPass: string) => {
    const infoAcc = await User.findByPk(sub);
      if(await(compare(newPass.trim(), infoAcc!.password))){
        return false;
      }
      return true;
  }
}
export default AuthService;

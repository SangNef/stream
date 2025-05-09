import { BadRequestResponse, NotFoundResponse, Unauthorized } from "../core/ErrorResponse";
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
    if(!refreshToken) throw new BadRequestResponse('DataInput Invalid 123!');

    const payload = jwtVerifyAccessToken(refreshToken, process.env.JWT_SECRET_REFRESHTOKEN!)
    if(!payload) throw new BadRequestResponse('RefreshToken Incorrect!');

    delete payload.exp;
    return res.status(200).json({ accessToken: jwtSignAccessToken(payload)});
  }

  static getProfileBySub = async (sub: number) => {
    const result = await User.findOne({
      attributes: [
        'id', 'fullname', 'username', 'avatar', 'role', 'balance',
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

  static changPassword = async (sub: number, role: string, newPass: string, code: string) => {
    if(role!=='user') throw new Unauthorized('Account Enough Rights!');

    if(!newPass || newPass.trim()==='') 
      throw new BadRequestResponse('DataInput Invalid! em')

    const infoAcc = await User.findByPk(sub);

    if(!await compare(code, infoAcc!.password)){
      throw new BadRequestResponse('Old Password Incorrect!')
    }

    const checkNewPass = await this.isNewPassword(sub, newPass, role);
    if(!checkNewPass) throw new BadRequestResponse('Cannot set new password the same as old password!');
    
    const result = await User.update({
      password: await hash(newPass.trim())
    }, { where: { id: sub}});

    return result;
  }

  // static sendCodeToMail = async (sub: number, role: string) => {
  //   if(role!=='user') throw new Unauthorized('Account Enough Right!');

  //   const infoAcc = await User.findByPk(sub);
    
  //   if(!infoAcc!.email) throw new BadRequestResponse('Account Not Email!')

  //   const transporter = nodemailer.createTransport({
  //     service: 'gmail',
  //     auth: {
  //       user: process.env.MAIL_EMAILADDRESS,
  //       pass: process.env.MAIL_PASSWORD
  //     }
  //   });
  //   const code = crypto.randomInt(100000, 999999).toString();
  //   cache.set(infoAcc.email, code);

  //   const formatEmail = {
  //     from: process.env.MAIL_EMAILADDRESS,
  //     to: infoAcc.email,
  //     subject: '[Livestream Aapp] - Mã xác nhận tài khoản',
  //     text: `<span>Mã xác nhận của bạn là: <b>${code}</b>. Mã sẽ hết hạn sau 2 phút.</span>`
  //   }

  //   await transporter.sendMail(formatEmail);
  //   console.log(`Đã gửi mã xác nhận đến ${infoAcc.email}`);
  //   return new OK({ message: 'Verify Code Sent To Your Email!'});
  // }

  // static verifyCode = (emailTo, code) => {
  //   const checkCode = cache.get(emailTo);
  //   if(checkCode && checkCode===code){
  //     return true;
  //   }
  //   return false;
  // }

  // Kiểm tra mật khẩu mới có khác với mật khẩu cũ.
  static isNewPassword = async (sub: number, newPass: string, role: string) => {
    if(role!=='user') return false;

    const infoAcc = await User.findByPk(sub);
      if(await(compare(newPass.trim(), infoAcc!.password))){
        return false;
      }
    return true;
  }
}
export default AuthService;

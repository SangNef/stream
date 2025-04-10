import { BadRequestResponse, NotFoundResponse, Unauthorized } from "../core/ErrorResponse";
import { compare, hash } from "../helpers/bcrypt";
import { jwtSignAccessToken, jwtVerifyAccessToken } from "../helpers/jwt";
import * as dotenv from "dotenv";
import nodemailer from "nodemailer";
import crypto from "crypto";
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
    if(!refreshToken) throw new BadRequestResponse('DataInput Invalid 123!');

    const payload = jwtVerifyAccessToken(refreshToken, process.env.JWT_SECRET_REFRESHTOKEN!)
    if(!payload) throw new BadRequestResponse('RefreshToken Incorrect!');

    delete payload.exp;
    return res.status(200).json({ accessToken: jwtSignAccessToken(payload)});
  }

  static getProfileBySub = async (sub: number, role: string) => {
    if(role!=='admin') throw new NotFoundResponse('NotFound Profile Match Account!');

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
      throw new BadRequestResponse('DataInput Invalid! em')

    const infoAcc = await User.findByPk(sub);

    if(!await compare(code, infoAcc!.password)){
      throw new BadRequestResponse('Old Password Incorrect!')
    }

    const checkNewPass = await this.isNewPassword(sub, newPass, role);
    if(!checkNewPass) throw new BadRequestResponse('Cannot set new password the same as old password!');
    
    await Admin.update({
      password: await hash(newPass.trim())
    }, { where: { id: sub}});

    return new OK({ message: "Updated Successfully!"});
  }

  static sendCodeToMail = async (sub: number, role: string) => {
    if(role!=='admin') throw new Unauthorized('Account Enough Rights!');

    const infoAcc = await Admin.findByPk(sub);
    if(!infoAcc!.email) throw new BadRequestResponse('Account Not Email!')

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_EMAILADDRESS,
        pass: process.env.MAIL_PASSWORD
      }
    });
    const code = crypto.randomInt(100000, 999999).toString();
    cache.set(infoAcc!.email, code);

    const formatEmail = {
      from: process.env.MAIL_EMAILADDRESS,
      to: infoAcc!.email,
      subject: '[Livestream Aapp] - Mã xác nhận tài khoản',
      text: `<span>Mã xác nhận của bạn là: <b>${code}</b>. Mã sẽ hết hạn sau 2 phút.</span>`
    }

    await transporter.sendMail(formatEmail);
    console.log(`Đã gửi mã xác nhận đến ${infoAcc!.email}`);
    return new OK({ message: 'Verify Code Sent To Your Email!'});
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

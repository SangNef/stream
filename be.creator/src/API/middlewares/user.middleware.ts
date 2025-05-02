import { Unauthorized } from "../core/ErrorResponse";
import { jwtVerifyAccessToken } from "../helpers/jwt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { ReqEntity } from "~/type/app.entities";
import { NextFunction, Response } from "express";

class AuthMiddleWare {
  static async checkAuth(req: ReqEntity, res: Response, next: NextFunction) {
    let token = req?.headers?.authorization;
    if (!token) throw new Unauthorized("Không thể thực hiện");
    if (token.startsWith("Bearer "))
      token = token.slice(7, token.length).trimLeft();
    const payload = jwtVerifyAccessToken(token, process.env.JWT_SECRET_ACCESSTOKEN!);
    req.user = payload as any;
    next();
  }
  static async checkTokenExpired(req: ReqEntity, res: Response, next: NextFunction) {
    const Authorization = req?.header("Authorization");
    const token = Authorization?.replace("Bearer ", "");
    console.log(token)
    if (!token) throw new Unauthorized("Không thể thực hiện");
    jwt.verify(token, process.env.JWT_SECRET_ACCESSTOKEN!, (err, user) => {
      if (err && err.message === "jwt expired") {
        next();
      } else if (user) {
        next();
      } else {
        throw new Unauthorized("Không thể thực hiện");
      }
    });
  }
  
  static async isRoleCreator(req: ReqEntity, res: Response, next: NextFunction) {
    const role = req.user?.role;
    if(role!=='creator'){
      throw res.status(400).json({ message: 'Tài khoản không đủ quyền!'});
    }
    next();
  }
}

export default AuthMiddleWare;

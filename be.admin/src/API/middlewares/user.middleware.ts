import { Unauthorized } from "../core/ErrorResponse";
import { jwtVerifyAccessToken } from "../helpers/jwt";
import jwt from "jsonwebtoken";
import "dotenv/config";
// import Admin from "../models/admin";
import { Response, NextFunction, Request } from "express";
import { ReqEntity } from "../../type/app.entities";
import Admin from "~/models/admin";

class AuthMiddleWare {
  static async checkAuth (req: ReqEntity, res: Response, next: NextFunction) {
    let token = req?.headers?.authorization;
    if (!token) throw new Unauthorized("Không thể thực hiện");
    if (token.startsWith("Bearer "))
      token = token.slice(7, token.length).trimLeft();
    const payload = jwtVerifyAccessToken(token, process.env.JWT_SECRET_ACCESSTOKEN!);
    req.user = payload as any;
    next();
  }
  static async checkTokenExpired(req: Request, res: Response, next: NextFunction) {
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

  static async isRoleAdmin(req: ReqEntity, res: Response, next: NextFunction) {
    const role = req.user?.role;
    if(role!=='admin' || !role) {
      res.status(400).json({ message: "Tài khoản không đủ quyền!"});
      throw new Unauthorized('Không thể thực hiện');
    }
    next();
  }

  static async isRoleUser(req: ReqEntity, res: Response, next: NextFunction) {
    const role = req.user?.role;
    if(role!=='user' || !role){
      res.status(400).json({ message: 'Tài khoản không đủ quyền!'});
      throw new Unauthorized('Không thể thực hiện');
    }
    next();
  }

  static difRoleAdmin(req: ReqEntity, res: Response, next: NextFunction) {
    const role = req.user.role;
    if(role!=='user'){
      res.status(400).json({ message: 'Tài khoản không đủ quyền!'});
      throw new Unauthorized('Không thể thực hiện');
    }
    next();
  }

  static async isRootAdmin (req: ReqEntity, res: Response, next: NextFunction) {
    const sub = req.user?.sub;
    const isRoot = await Admin.findOne({ where: {
      id: sub,
      role: 'super_admin'
    }});
    if(!isRoot){
      res.status(400).json({ message: "Tài khoản không đủ quyền!"});
      throw new Unauthorized('Không thể thực hiện');
    }
    next();
  }
}

export default AuthMiddleWare;

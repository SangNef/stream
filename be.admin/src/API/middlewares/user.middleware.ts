import { Unauthorized } from "../core/ErrorResponse";
import { jwtVerifyAccessToken } from "../helpers/jwt";
import jwt from "jsonwebtoken";
import "dotenv/config";
// import Admin from "../models/admin";
import { Response, NextFunction, Request } from "express";
import { ReqEntity } from "../../type/app.entities";
import Admin from "~/models/admin";

class AuthMiddleWare {
  static checkAuth(req: ReqEntity, res: Response, next: NextFunction) {
    let token = req?.headers?.authorization;
    if (!token) throw new Unauthorized("Unauthorized");
    if (token.startsWith("Bearer "))
      token = token.slice(7, token.length).trimLeft();
    const payload = jwtVerifyAccessToken(token, process.env.JWT_SECRET_ACCESSTOKEN!);
    req.user = payload as any;
    next();
  }
  static checkTokenExpired(req: Request, res: Response, next: NextFunction) {
    const Authorization = req?.header("Authorization");
    const token = Authorization?.replace("Bearer ", "");
    console.log(token)
    if (!token) throw new Unauthorized("Unauthorized");
    jwt.verify(token, process.env.JWT_SECRET_ACCESSTOKEN!, (err, user) => {
      if (err && err.message === "jwt expired") {
        next();
      } else if (user) {
        next();
      } else {
        throw new Unauthorized("Unauthorized");
      }
    });
  }

  static isRoleAdmin(req: ReqEntity, res: Response, next: NextFunction) {
    const role = req.user?.role;
    if(role!=='admin' || !role) {
      res.status(400).json({ message: "Account Enough Rights!"});
      throw new Unauthorized('Unauthorized');
    }
    next();
  }

  static isRoleUser(req: ReqEntity, res: Response, next: NextFunction) {
    const role = req.user?.role;
    if(role!=='user' || !role){
      res.status(400).json({ message: 'Account Enough Rights!'});
      throw new Unauthorized('Unauthorized');
    }
    next();
  }

  static difRoleAdmin(req: ReqEntity, res: Response, next: NextFunction) {
    const role = req.user.role;
    if(role!=='user'){
      res.status(400).json({ message: 'Account Enough Rights!'});
      throw new Unauthorized('Unauthorized');
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
      res.status(400).json({ message: "Account Enough Rights!"});
      throw new Unauthorized('Unauthorized');
    }
    next();
  }
}

export default AuthMiddleWare;

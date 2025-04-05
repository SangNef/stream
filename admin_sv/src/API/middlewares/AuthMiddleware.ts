import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

class AuthMiddleware {
    static checkAuth = (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization?.split(" ")[1];
        console.log("req: " + token)
    
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
    
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_ACCESSTOKEN as string);
            console.log(decoded)
            req.user = decoded as { id: string };
            next();
        } catch (error) {
            res.status(401).json({ message: "Token hết hạn" });
        }
    }
}

export default AuthMiddleware;
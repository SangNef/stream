import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import "dotenv/config";

// Đảm bảo các biến môi trường không undefined
const JWT_SECRET_ACCESSTOKEN: Secret = process.env.JWT_SECRET_ACCESSTOKEN as string;
const JWT_EXPIRES_IN_ACCESSTOKEN: string = process.env.JWT_EXPIRES_IN_ACCESSTOKEN || "1h";
const JWT_SECRET_REFRESHTOKEN: Secret = process.env.JWT_SECRET_REFRESHTOKEN as string;
const JWT_EXPIRES_IN_REFRESHTOKEN: string = process.env.JWT_EXPIRES_IN_REFRESHTOKEN || "7d";

// Kiểm tra nếu các biến môi trường không được đặt
if (!JWT_SECRET_ACCESSTOKEN || !JWT_SECRET_REFRESHTOKEN) {
    throw new Error("JWT secret keys are not defined in environment variables.");
}

// Định nghĩa kiểu dữ liệu cho payload
interface JwtPayloadCustom extends JwtPayload {
    id: string;
    email: string;
}

// Hàm tạo Access Token
export const jwtSignAccessToken = (data: JwtPayloadCustom): string => {
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN_ACCESSTOKEN as SignOptions['expiresIn'] };
    return jwt.sign(data, JWT_SECRET_ACCESSTOKEN, options);
};

// Hàm tạo Refresh Token
export const jwtSignRefreshToken = (data: JwtPayloadCustom): string => {
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN_REFRESHTOKEN as SignOptions['expiresIn'] };
    return jwt.sign(data, JWT_SECRET_REFRESHTOKEN, options);
};

// Hàm xác minh Access Token
export const jwtVerifyAccessToken = (token: string, jwtKey: Secret): JwtPayloadCustom | null => {
    try {
        return jwt.verify(token, jwtKey) as JwtPayloadCustom;
    } catch (error) {
        return null;
    }
};

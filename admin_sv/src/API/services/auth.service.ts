import { BadRequestError } from "~/API/core/error.response";

import { compare } from "~/API/helpers/bcrypt";
import { Op } from "sequelize";

import { jwtSignAccessToken, jwtSignRefreshToken, jwtVerifyAccessToken } from "~/API/helpers/jwt";
import { Admin } from "~/models";

interface TLogin {
    email: string;
    password: string;
}
interface TResLogin {
    id: string;
    accessToken: string;
    refreshToken: string;
}

class AuthService {
    static login = async ({ email, password }: TLogin): Promise<TResLogin> => {
        console.log("email", email);
        console.log("password", password);
        if (!email || !password) throw new BadRequestError("Tài khoản hoặc mật khẩu không chính xác", 9);
        
        const admin = await Admin.findOne({
            where: {
                [Op.or]: [{ email }]
            }
        })

        if (!admin) throw new BadRequestError("Tài khoản hoặc mật khẩu không chính xác", 9);

        if (admin && !(await compare(password, admin.password))) throw new BadRequestError("Tài khoản hoặc mật khẩu không chính xác", 9);

        if (admin && admin.deletedAt) throw new BadRequestError("Tài khoản đã bị khóa", 9);

        const payload = { id: String(admin.id), email: admin.email, role: admin.role };
        console.log("payload", payload);
        const accessToken = jwtSignAccessToken(payload);
        const refreshToken = jwtSignRefreshToken(payload);

        return { id: String(admin.id), accessToken: accessToken, refreshToken: refreshToken };
    };

    static refreshToken = async (refreshToken: string): Promise<TResLogin> => {
        if (!refreshToken) throw new BadRequestError("Token không hợp lệ 1", 9);

        if (!process.env.JWT_SECRET_REFRESHTOKEN) throw new BadRequestError("Token không hợp lệ 4", 9);
        const payload = jwtVerifyAccessToken(refreshToken, process.env.JWT_SECRET_REFRESHTOKEN) as any;
        if (!payload) throw new BadRequestError("Token không hợp lệ 2", 9);

        const admin = await Admin.findOne({
            where: {
                id: payload.id
            }
        });

        if (!admin) throw new BadRequestError("Token không hợp lệ 3", 9);

        const accessToken = jwtSignAccessToken({ id: String(admin.id), email: admin.email });

        return { id: String(admin.id), accessToken: accessToken, refreshToken };
    }
}

export default AuthService;

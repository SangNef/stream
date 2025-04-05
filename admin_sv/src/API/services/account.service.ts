import { BadRequestError } from "~/API/core/error.response";
import { Admin } from "~/models/admin";

interface AdminRes {
    id: number;
    name?: string;
    email?: string;
    role?: string;
}

interface AdminReq {
    name?: string;
}

class AccountService {
    static async getProfile(sub: string): Promise<AdminRes> {
        const admin = await Admin.findOne({
            where: {
                id: sub
            }
        })

        if (!admin) {
            throw new BadRequestError('Không tìm thấy thông tin người dùng');
        }

        return {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
        };
    }

    static async updateProfile(sub: string, data: AdminReq): Promise<AdminRes> {
        const admin = await Admin.findOne({
            where: {
                id: sub
            }
        })

        if (!admin) {
            throw new BadRequestError('Không tìm thấy thông tin người dùng');
        }

        if (data.name) {
            admin.name = data.name;
        }
        await admin.save();

        return { id: admin.id };
    }

}

export default AccountService;

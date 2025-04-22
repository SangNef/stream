import { Op } from "sequelize";
import Admin from "../../models/admin";
import { AdminActionModelEntity } from "~/type/app.entities";
import { AdminAction } from "~/models";

class AdminHistoryService {
    static getHistories = async (page: number, limit: number, admin_id: number, action: string, start_date: string, end_date: string) => {
        const pageCurrent = Number.isNaN(page)? 1: page;
        const recordsOfPage = Number.isNaN(limit)? 10: limit;
        const offset = (pageCurrent-1)*recordsOfPage;

        let condition = {} as any;
        if(!Number.isNaN(admin_id)) condition.admin_id = admin_id;
        if(action && action.trim()!=='') condition.action = action;

        const startDate = new Date(start_date) as any;
        const endDate = new Date(end_date) as any;
        if (!isNaN(startDate) || !isNaN(endDate)) {
            if (!isNaN(startDate) && !isNaN(endDate)) {
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                const start = startDate.getTime() - 7 + 0 * 60 * 60 * 1000;
                const end = endDate.getTime() - 7 + 0 * 60 * 60 * 1000;
                condition.createdAt = { [Op.between]: [start, end] };
            } else if (!isNaN(startDate) && isNaN(endDate)) {
                startDate.setHours(0, 0, 0, 0);
                const start = startDate.getTime() - 7 + 0 * 60 * 60 * 1000;
                condition.createdAt = { [Op.gte]: start };
            } else if (isNaN(startDate) && !isNaN(endDate)) {
                endDate.setHours(23, 59, 59, 999);
                const end = endDate.getTime() - 7 + 0 * 60 * 60 * 1000;
                condition.createdAt = { [Op.lte]: end };
            }
        }

        const result = await AdminAction.findAndCountAll({
            limit: recordsOfPage,
            offset,
            attributes: ['id', 'admin_id', 'action', 'createdAt'],
            include: [{
                model: Admin,
                as: 'admins',
                attributes: ['name', 'email', 'role', 'createdAt']
            }],
            order: [['id', 'DESC']],
            where: condition
        });

        return {
            totalItems: result.count,
            totalPages: Math.ceil(result.count/recordsOfPage),
            pageCurrent,
            recordsOfPage,
            records: result.rows
        }
    }

    static addNew = async (data: AdminActionModelEntity) => {
        const formatAdminHistory = {
            admin_id: data.admin_id,
            action: data.action,
        }

        try {
            await AdminAction.create(formatAdminHistory);
        } catch (error) {
            console.log('[Admin History Error]:: Error: ', error)
            throw error;
        }
    }
}

export default AdminHistoryService;
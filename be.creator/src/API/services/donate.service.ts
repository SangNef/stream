import { Op } from "sequelize";
import { Donate, DonateItemModel, Stream, User } from "~/models";
import { getConfigByKey } from "../helpers/function";

class UserDonateService {
    // Chỉ dành cho creator.
    static getListInfoUserDonated = async (sub: number, page: number, limit: number, search: string) => {
        const pageCurrent = Number.isNaN(page)? 1: page;
        const recordsOfPage = Number.isNaN(limit)? 10: limit;
        const offset = (pageCurrent-1)*recordsOfPage;

        let condition = {} as any;
        if(search){
            if (!condition[Op.or]) condition[Op.or] = [];

            condition[Op.or].push(
                { fullname: { [Op.like]: `%${search}%` }},
                { username: { [Op.like]: `%${search}%` }},
            )
        }

        const result = await Donate.findAndCountAll({
            limit: recordsOfPage,
            offset,
            attributes: ['id', 'user_id', 'item_id', 'amount', 'createdAt'],
            include: [
                {
                    model: User,
                    as: 'users',
                    attributes: ['fullname', 'username', 'avatar', 'role', 'phone'],
                    where: condition
                },
                {
                    model: DonateItemModel,
                    as: 'donateitems',
                    attributes: ['name', 'image', 'price']
                },
                {
                    model: Stream,
                    as: 'streams',
                    attributes: ['user_id', 'view', 'status', 'createdAt'],
                    where: { user_id: sub },
                    required: true
                }
            ],
            order: [['id', 'DESC']],
            distinct: true
        });

        let percent = 0;
        const keyCommissionPercent = await getConfigByKey('donate-percent');
        if(keyCommissionPercent){
            percent = parseInt(keyCommissionPercent.value);
        }

        let totalDonate = 0, totalRevice = 0;
        result.rows.map(items => {
            totalDonate += parseInt(items.amount as any);
        });
        totalRevice = (totalDonate*percent)/100;

        return {
            totalItems: result.count,
            totalPages: Math.ceil(result.count/recordsOfPage),
            pageCurrent,
            recordsOfPage,
            totalDonate,
            percent,
            totalRevice,
            records: result.rows
        }
    }
}

export default UserDonateService;
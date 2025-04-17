import { Op } from "sequelize";
import { DonateItemModel } from "~/models";
import { DonateItemEntity } from "~/type/app.entities";

interface FilterItem extends DonateItemEntity {
    min_price: number
    max_price: number
}

class UserDonateItemService {
    static getList = async (page: number, limit: number, filter: Partial<FilterItem>, isParanoid: boolean) => {
        const pageCurrent = Number.isNaN(page)? 1: page;
        const recordsOfPage = Number.isNaN(limit)? 10: limit;
        const offset = (pageCurrent-1)*recordsOfPage;

        let condition = {} as any;
        if(filter.name && filter.name.trim()!=='') condition.name = { [Op.like]: `%${filter.name}%` };
        if(!Number.isNaN(filter.price) && filter.price! >= 1000) condition.price = filter.price;
        if(!Number.isNaN(filter.min_price) || !Number.isNaN(filter.max_price)){
            if(!Number.isNaN(filter.min_price) && !Number.isNaN(filter.max_price)){
                condition.price = { [Op.between]: [filter.min_price, filter.max_price] }
            } else if (!Number.isNaN(filter.min_price) && Number.isNaN(filter.max_price)){
                condition.price = { [Op.gte]: filter.min_price }
            } else if (Number.isNaN(filter.min_price) && !Number.isNaN(filter.max_price)){
                condition.price = { [Op.lte]: filter.max_price }
            }
        }

        const result = await DonateItemModel.findAndCountAll({
            limit: recordsOfPage,
            offset,
            attributes: ['id', 'name', 'image', 'price', 'createdAt', 'deletedAt'],
            order: [['id', 'DESC']],
            where: condition,
            paranoid: isParanoid
        });

        return {
            totalItems: result.count,
            totalPages: Math.ceil(result.count/recordsOfPage),
            pageCurrent,
            recordsOfPage,
            records: result.rows
        }
    }
}

export default UserDonateItemService;
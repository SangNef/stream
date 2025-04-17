import { DonateItemEntity } from "~/type/app.entities";
import { BadRequestResponse, NotFoundResponse } from "../core/ErrorResponse";
import { DonateItemModel } from "~/models";
import { Op } from "sequelize";

interface FilterItem extends DonateItemEntity {
    min_price: number
    max_price: number
}

class AdminDonateItemService {
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

    static addNew = async (data: Partial<DonateItemEntity>) => {
        if(
            (!data.name || data.name.trim()==='' || typeof(data.name)!=='string') ||
            (!data.image || data.image.trim()==='' || typeof(data.image)!=='string') ||
            (Number.isNaN(data.price))
        ) throw new BadRequestResponse('DataInput Invalid!');

        const formatDonateItem = {
            name: data.name!,
            image: data.image!,
            price: data.price!
        }
        const result = await DonateItemModel.create(formatDonateItem);
        return result;
    }

    static update = async (id: number, data: Partial<DonateItemEntity>) => {
        if(
            Number.isNaN(id) ||
            (data.name && (data.name.trim()==='' || typeof(data.name)!=='string')) ||
            (data.image && (data.image.trim()==='' || typeof(data.image)!=='string')) ||
            (data.price && (Number.isNaN(data.price) || data.price <= 1000))
        ) throw new BadRequestResponse('DataInput Invalid!');

        const itemExisted = await DonateItemModel.findOne({
            where: { id },
            paranoid: false
        });
        if(!itemExisted) throw new NotFoundResponse('Donate Item Not Exist!');

        const formatDonateItem = {
            name: data.name || itemExisted.name,
            image: data.image || itemExisted.image,
            price: data.price || itemExisted.price
        }

        const result = await DonateItemModel.update(formatDonateItem, {
            where: { id }
        });
        return result;
    }

    static delOrRestore = async (id: number, is_delete: boolean) => {
        if(Number.isNaN(id)) throw new BadRequestResponse('ParamInput Invalid!');

        let result = 0 as any, message = '';
        if(is_delete){
            const itemExisted = await DonateItemModel.findByPk(id);
            if(!itemExisted) throw new NotFoundResponse('Donate Item Not Exist!')

            result = await DonateItemModel.destroy({ where: { id }});
            message = 'Deleted Donate Item Successfully!';
        } else {
            const itemDeleted = await DonateItemModel.findOne({
                where: { id, deletedAt: {[Op.ne]: null} },
                paranoid: false
            });
            if(!itemDeleted) throw new NotFoundResponse('Donate Item Havenot Been Deleted!');

            result = await DonateItemModel.restore({ where: { id }});
            message = 'Restored Donate Item Successfully!';
        }

        return { result, message };
    }
}

export default AdminDonateItemService;
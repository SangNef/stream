import { DonateItemEntity } from "~/type/app.entities";
import { BadRequestResponse, NotFoundResponse } from "../core/ErrorResponse";
import { DonateItemModel } from "~/models";
import { Op } from "sequelize";
import AdminHistoryService from "./admin.history.service";

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

    static addNew = async (sub: number, data: Partial<DonateItemEntity>) => {
        if(
            (!data.name || data.name.trim()==='' || typeof(data.name)!=='string') ||
            (!data.image || data.image.trim()==='' || typeof(data.image)!=='string') ||
            (Number.isNaN(data.price))
        ) throw new BadRequestResponse('Dữ liệu thêm mới không hợp lệ!');

        const formatDonateItem = {
            name: data.name!,
            image: data.image!,
            price: data.price!
        }
        const result = await DonateItemModel.create(formatDonateItem);

        await AdminHistoryService.addNew({
            admin_id: sub,
            action: `Thêm mới vật phẩm quà tặng ${result.id}`
        });

        return result;
    }

    static update = async (sub: number, id: number, data: Partial<DonateItemEntity>) => {
        if(
            Number.isNaN(id) ||
            (data.name && (data.name.trim()==='' || typeof(data.name)!=='string')) ||
            (data.image && (data.image.trim()==='' || typeof(data.image)!=='string')) ||
            (data.price && (Number.isNaN(data.price) || data.price <= 1000))
        ) throw new BadRequestResponse('Dữ liệu cập nhật không hợp lệ!');

        const itemExisted = await DonateItemModel.findOne({
            where: { id },
            paranoid: false
        });
        if(!itemExisted) throw new NotFoundResponse('Vật phẩm quà tặng không tồn tại!');

        const formatDonateItem = {
            name: data.name || itemExisted.name,
            image: data.image || itemExisted.image,
            price: data.price || itemExisted.price
        }

        const result = await DonateItemModel.update(formatDonateItem, {
            where: { id }
        });

        await AdminHistoryService.addNew({
            admin_id: sub,
            action: `Cập nhật thông tin vật phẩm quà tặng ${id}`
        });

        return result;
    }

    static delOrRestore = async (sub: number, id: number, is_delete: boolean) => {
        if(Number.isNaN(id)) throw new BadRequestResponse('ID vật phẩm không hợp lệ!');

        let result = 0 as any, message = '';
        if(is_delete){
            const itemExisted = await DonateItemModel.findByPk(id);
            if(!itemExisted) throw new NotFoundResponse('Vật phẩm quà tặng không tồn tại!')

            result = await DonateItemModel.destroy({ where: { id }});
            message = 'Xóa vật phẩm quà tặng thành công!';
        } else {
            const itemDeleted = await DonateItemModel.findOne({
                where: { id, deletedAt: {[Op.ne]: null} },
                paranoid: false
            });
            if(!itemDeleted) throw new NotFoundResponse('Vật phẩm này chưa bị xóa. Không thể khôi phục!');

            result = await DonateItemModel.restore({ where: { id }});
            message = 'Khôi phục vật phẩm quà tặng thành công!';
        }

        await AdminHistoryService.addNew({
            admin_id: sub,
            action: `${message.includes('Xóa')? 'Xóa': 'Khôi phục'} vật phẩm quà tặng ${id}`
        });

        return { result, message };
    }
}

export default AdminDonateItemService;
import { cast, Op } from "sequelize";
import { DonateModelEntity } from "~/type/app.entities";
import { BadRequestResponse } from "../core/ErrorResponse";
import { Donate, DonateItemModel, Stream, User } from "~/models";

interface FilterDonate extends DonateModelEntity {
    min_amount: number
    max_amount: number
    is_paranoid: boolean
}

class AdminDonateService {
    static getDonates = async (page: number, limit: number, filter: Partial<FilterDonate>) => {
        const pageCurrent = Number.isNaN(page)? 1: page;
        const recordsOfPage = Number.isNaN(limit)? 10: limit;
        const offset = (pageCurrent-1)*recordsOfPage;

        let condition = {} as any;
        if(!Number.isNaN(filter.user_id)) condition.user_id = filter.user_id;
        if(!Number.isNaN(filter.item_id)) condition.item_id = filter.item_id;
        if(!Number.isNaN(filter.stream_id)) condition.stream_id = filter.stream_id;
        if(!Number.isNaN(filter.amount)) {
            condition.amount = filter.amount;
        } else {
            if(!Number.isNaN(filter.min_amount) || !Number.isNaN(filter.max_amount)) {
                if(!Number.isNaN(filter.min_amount) && !Number.isNaN(filter.max_amount)) {
                    if(filter.min_amount! > filter.max_amount!)
                        throw new BadRequestResponse('Giá trị min không được lớn hơn giá trị max!');

                    condition.amount = { [Op.between]: [cast(filter.min_amount, 'DECIMAL(10, 2)'), cast(filter.max_amount, 'DECIMAL(10, 2)')] };
                } else if (!Number.isNaN(filter.min_amount) && Number.isNaN(filter.max_amount)) {
                    condition.amount = { [Op.gte]: cast(filter.min_amount, 'DECIMAL(10, 2)') };
                } else if (Number.isNaN(filter.min_amount) && !Number.isNaN(filter.max_amount)) {
                    condition.amount = { [Op.lte]: cast(filter.max_amount, 'DECIMAL(10, 2)') };
                }
            }
        }

        const result = await Donate.findAndCountAll({
            limit: recordsOfPage,
            offset,
            attributes: ['id', 'user_id', 'item_id', 'stream_id', 'amount', 'createdAt', 'updatedAt'],
            include: [
                {
                    model: User,
                    as: 'users',
                    attributes: ['fullname', 'username', 'avatar', 'phone']
                },
                {
                    model: DonateItemModel,
                    as: 'donateitems',
                    attributes: ['name', 'image', 'price']
                },
                {
                    model: Stream,
                    as: 'streams',
                    attributes: ['user_id', 'thumbnail', 'stream_url', 'title', 'view', 'status', 'createdAt'],
                    include: [{
                        model: User,
                        as: 'users',
                        attributes: ['fullname', 'username', 'avatar', 'phone']
                    }]
                }
            ],
            where: condition,
            paranoid: filter.is_paranoid
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

export default AdminDonateService;
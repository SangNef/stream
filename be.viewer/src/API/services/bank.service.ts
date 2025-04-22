import { BankModelEntity } from "~/type/app.entities";
import { BadRequestResponse, NotFoundResponse } from "../core/ErrorResponse";
import { Bank } from "~/models";
import { Op } from "sequelize";

class UserBankService {
    static getBanks = async (sub: number, page: number, limit: number, bank_name: string) => {
        const pageCurrent = !Number.isNaN(page)? page: 1;
        const recordsPage = Number.isNaN(limit)? 10: limit;
        const offset = (pageCurrent - 1) * recordsPage;

        let condition = {} as any;
        condition.user_id = sub;
        if(bank_name && bank_name.trim()!=='') condition.bank_name = { [Op.like]: `%${bank_name}%` };

        const result = await Bank.findAndCountAll({
            limit: recordsPage,
            offset,
            attributes: ['id', 'bank_name', 'bank_account', 'bank_username', 'createdAt'],
            where: condition
        });

        return{
            totalItems: result.count,
            totalPages: Math.ceil(result.count / recordsPage),
            pageCurrent: pageCurrent,
            recordsOfPage: recordsPage,
            records: result.rows
        }
    }

    static addNew = async (data: Partial<BankModelEntity>) => {
        if(
            (!data.bank_name || data.bank_name.trim()==='' || typeof(data.bank_name)!=='string') ||
            (!data.bank_account || data.bank_account.trim()==='' || typeof(data.bank_account)!=='string') ||
            (!data.bank_username || data.bank_username.trim()==='' || typeof(data.bank_username)!=='string')
        ) throw new BadRequestResponse('DataInput Invalid!');

        const bankExisted = await Bank.findOne({ where: {
            user_id: data.user_id!,
            bank_name: data.bank_name,
            bank_account: data.bank_account
        }});
        if(bankExisted) throw new BadRequestResponse('Bank information has been used!');

        const formatBank = {
            user_id: data.user_id!,
            bank_name: data.bank_name!,
            bank_account: data.bank_account!,
            bank_username: data.bank_username!
        }
        const result = await Bank.create(formatBank);
        return result;
    }

    static delBank = async (sub: number, bank_id: number) => {
        if(Number.isNaN(bank_id)) throw new BadRequestResponse('ParamInput Invalid!');

        const bankExisted = await Bank.findOne({ where: {
            id: bank_id, user_id: sub
        }});
        if(!bankExisted) throw new NotFoundResponse('NotFound Bank!');

        const result = await Bank.destroy({ where: { id: bank_id } });
        return result;
    }
}

export default UserBankService;
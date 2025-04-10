import { BadRequestResponse, NotFoundResponse } from "../core/ErrorResponse";
import ConfigModel from "../../models/config";

class AdminConfigService {
    static getConfigByKey = async (key: string) => {
        if(typeof(key)!=='string' || key.trim()==='' || key===':key')
            throw new BadRequestResponse('ParamInput Invalid!');

        const keyExisted = await ConfigModel.findOne({
            where: { key }
        });
        if(!keyExisted) throw new NotFoundResponse('Key Not Exist!');

        const result = await ConfigModel.findOne({
            where: { key }
        });
        return result;
    }
}

export default AdminConfigService;
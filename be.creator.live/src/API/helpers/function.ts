// value có giá trị là 0, false (tất cả các trường hợp viết in hoa)
// sẽ trả về false. Các trường hợp còn lại (bao gồm cả không có giá trị)

import ConfigModel from "~/models/config";
import { BadRequestResponse, NotFoundResponse } from "../core/ErrorResponse";

// đều trả về true.
export const stringToBoolean = (value: string) => {
    if (value === undefined || value === null) return true;
    const normalizedValue = value.toLowerCase().trim();
    return !(normalizedValue === "0" || normalizedValue === "false");
}

export const getConfigByKey = async (key: string) => {
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
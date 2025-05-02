import { WebSocket } from "ws";
import logger from "jet-logger";
import { WSMessage } from "../wsTypes";
import { DonateItemModel, User } from "~/models";
import redisClient from "~/API/helpers/redis";
import { addNewDonate } from "../models/donate";

export const DONATE = async (ws: WebSocket, data: WSMessage, info: User) => {
    const dataReq = data.payload;

    const streamRedis = await redisClient.get(`stream${dataReq.stream_id}`);
    const allViewerStream: any[] = JSON.parse(streamRedis!);
    const isWatching = allViewerStream.find(items => items?.id === info.id);
    if(!isWatching) ws.send(JSON.stringify({
        type: 'DONATE_ERROR',
        message: 'Bạn chưa tham gia phiên live này!'
    }));

    try {
        let valueDonate = 0;
        if(dataReq.item_id){
            const parseIntItemID = parseInt(dataReq.item_id);
            if(Number.isNaN(parseIntItemID)){
                return ws.send(JSON.stringify({
                    type: 'DONATE_ERROR',
                    message: 'ID vật phẩm quà tặng không hợp lệ!'
                }));
            }

            const itemExisted = await DonateItemModel.findByPk(parseIntItemID);
            if(!itemExisted){
                return ws.send(JSON.stringify({
                    type: 'DONATE_ERROR',
                    message: 'Vật phẩm quà tặng không tồn tại!'
                }));
            }

            valueDonate = parseInt(itemExisted.price as any);
        }

        const sub = info.id;
        const value = valueDonate!==0? valueDonate: dataReq.value;
        const dataDonate = {
            item_id: dataReq.item_id || null,
            stream_id: dataReq.stream_id,
            amount: value
        }
        const result = await addNewDonate(sub, dataDonate)
        if(typeof(result)==='string'){
            return ws.send(JSON.stringify({ type: 'donate-error', message: result }));
        } else if (result===true){
            await redisClient.publish('donate', JSON.stringify({
                type: 'new-donate',
                stream_id: dataReq.stream_id,
                value: dataReq.value,
                content: dataReq.content,
                user: info
            }));
        }
    } catch (error) {
        logger.err('[WebSocket Error]:: Donate Error: ', error);
        console.log(error)
        ws.send(JSON.stringify({ type: 'donate-error', message: error.message }))
    }
}
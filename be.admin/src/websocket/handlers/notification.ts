import { Notification, sequelize } from "~/models"
import { WSMessage } from "../wsTypes";

interface DataNoti {
    user_id: number;
    noti_id: number
}

export const READ_NOTI = async (ws: WebSocket, data: WSMessage) => {
    const dataReq: DataNoti = data.payload;
    const readTransaction = await sequelize.transaction();
    
    const isRead = await isReadNotiLive(dataReq.user_id, dataReq.noti_id, readTransaction);
    if(typeof(isRead)==='string'){
        ws.send(JSON.stringify({
            type: 'READ_NOTI_ERROR',
            message: isRead
        }));
        await readTransaction.rollback();
    } else if(typeof(isRead)==='boolean'){
        ws.send(JSON.stringify({
            type: 'READ_NOTI_SUCCESS',
            payload: {
                noti_id: dataReq.noti_id,
                status: 'success'
            }
        }));
        await readTransaction.commit();
    } else await readTransaction.rollback();
}

const isReadNotiLive = async (sub: number, noti_id: number, transaction: any) => {
    try {
        if(!noti_id || Number.isNaN(noti_id)) return "ID Thông báo không hợp lệ!";

        const notiExisted = await Notification.findOne({ where: {
            id: noti_id,
            user_id: sub
        }});
        if(!notiExisted) return "Không tìm thấy thông báo!";

        await Notification.update(
            { is_read: true }, 
            {
                where: { id: notiExisted.dataValues.id },
                transaction
            }
        );
        return true;
    } catch (error) {
        console.log('[WebSocket - isReadNotiLive]:: Error: ', error);
    }
}
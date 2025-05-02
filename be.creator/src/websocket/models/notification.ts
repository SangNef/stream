import { Follower, Notification } from "~/models";
import { NotiModelType } from "~/type/app.entities";

// Tạo thông báo loại live.
export const createNotiLive = async (creatorId: number, dataStream: any) => {
    try {
        const allFollower = await Follower.findAll({ 
            attributes: ['user_id'],
            where: {
                creator_id: creatorId
            }
        });
        if(allFollower.length==0) return "Chưa có người theo dõi nào!";

        let formatResult = [];
        for(let i=0; i<allFollower.length; i++){
            const formatNotiLive = {
                user_id: allFollower[i].user_id,
                type: 'live' as NotiModelType,
                title: dataStream.title,
                content: dataStream.content,
                is_read: false,
                navigate_to: null as any
            }
            const query = await Notification.create(formatNotiLive);
            formatResult.push({
                user_id: query.user_id,
                noti_id: query.id
            });
        }

        return typeof(allFollower)==='string'? allFollower: formatResult;
    } catch (error) {
        console.log('[WebSocket - createNoti]:: Error: ', error);
    }
}

export const isReadNotiLive = async (sub: number, noti_id: number, transaction: any) => {
    try {
        if(!noti_id || Number.isNaN(noti_id)) return "Notify ID Invalid!";

        const notiExisted = await Notification.findOne({ where: {
            id: noti_id,
            user_id: sub
        }});
        if(!notiExisted) return "NotFound Notification!";

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
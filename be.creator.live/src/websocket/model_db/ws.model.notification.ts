import Follower from "~/models/follower";
import Notification from "../../models/notification";

// Tạo thông báo loại live.
export const createNotiLive = async (creatorId: number, dataStream: any) => {
    try {
        const allFollower = await Follower.findAll({ 
            attributes: ['follower_id'],
            where: {
                user_id: creatorId
            }
        });
        if(allFollower.length==0) return "Chưa có người theo dõi nào!";

        let formatResult = [];
        for(let i=0; i<allFollower.length; i++){
            const formatNotiLive = {
                user_id: allFollower[i].follower_id,
                type: 'live' as 'live' | 'coin',
                title: dataStream.title,
                content: dataStream.content,
                is_read: false
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
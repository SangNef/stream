// import Notification from "../../models/notification";

// export const isReadNotiLive = async (sub: number, noti_id: number, transaction: any) => {
//     try {
//         if(!noti_id || Number.isNaN(noti_id)) return "Notify ID Invalid!";

//         const notiExisted = await Notification.findOne({ where: {
//             id: noti_id,
//             user_id: sub
//         }});
//         if(!notiExisted) return "NotFound Notification!";

//         await Notification.update(
//             { is_read: true }, 
//             {
//                 where: { id: notiExisted.dataValues.id },
//                 transaction
//             }
//         );
//         return true;
//     } catch (error) {
//         console.log('[WebSocket - isReadNotiLive]:: Error: ', error);
//     }
// }
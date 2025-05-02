// import { WebSocketServer } from "ws";
// import logger from "jet-logger";
// import sequelize from "../config/database";
// import { saveNewConnectToWebSocket } from "./ws.service";
// import { isReadNotiLive } from "./model_db/ws.model.notification";
// import config from "~/config";

// export const arrViewer = new Map(); // Danh sách tài khoản tham gia một livestream.
// export const arrStream = new Map(); // Danh sách livestream.
// const allClient = new Map(); // Danh sách người dùng đang online.
// const SERVER_ID = 'ws-admin';

// export default async function WebSocket_Server (server: any) {
//     const websocket = new WebSocketServer({ server });
//     logger.info(`WebSocket running on port: ${config.Port}`);

//     websocket.on('connection', async (ws, req: any) => {
//         const newConnect = await saveNewConnectToWebSocket(ws, req);
//         // const streamKey = getStreamKeyInConnection(ws, req);
//         if(!newConnect){
//             console.log('[WebSocket]: Tự động ngắt kết nối do token không hợp lệ!');
//             return ws.close();
//         }
//         // if(streamKey) console.log('[WebSocket --- Connected]:: New Connected With Stream Key: ', streamKey);
//         allClient.set(newConnect.id, {
//             id: newConnect.id,
//             ws
//         });
//         console.log(`User ${newConnect.id} connected!`);

//         ws.on('message', async (data) => {
//             const dataReq = JSON.parse(data.toString());
//             // === Áp dụng cho cả creator và user ===  //
//             if(dataReq.type==='set-online'){
//                 ws.send(JSON.stringify({
//                     type: 'online-user',
//                     payload: { isOnline: true }
//                 }))
//             }

//             if(dataReq.type==='read-noti'){
//                 const readNoti_transaction = await sequelize.transaction();
//                 try {
//                     const isRead = await isReadNotiLive(newConnect.id, dataReq.noti_id, readNoti_transaction);
//                     if(typeof(isRead)==='string'){
//                         ws.send(JSON.stringify({
//                             type: 'read-noti-error',
//                             message: isRead
//                         }))
//                     } else if(typeof(isRead)==='boolean'){
//                         ws.send(JSON.stringify({
//                             type: 'read-noti-ok',
//                             payload: {
//                                 noti_id: dataReq.noti_id,
//                                 status: 'Success'
//                             }
//                         }));
//                         await readNoti_transaction.commit();
//                     } else await readNoti_transaction.rollback();
//                 } catch (error) {
//                     await readNoti_transaction.rollback();
//                     console.log('[WebSocket - ReadNotiLive]:: Error: ', error);
//                 }
//             }
//         });

//         ws.on('close', async () => {
//             allClient.delete(newConnect.id);
//             console.log(`User ${newConnect.id} disconnected!`);
//         });
//     });
// }
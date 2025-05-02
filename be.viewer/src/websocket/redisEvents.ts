import redisClient from "~/API/helpers/redis";
import { onlineUsers } from "./onlineUsers";
import { viewStream } from "./viewStream";
import { WebSocket } from "ws";

export default async function WS_RedisEvents () {
    await redisClient.configSet('notify-keyspace-events', 'Ex');

    const events = redisClient.duplicate();
    await events.connect();

    await events.subscribe('noti-stream', message => {
        console.log('nahanj')
        const { socketId, payload } = JSON.parse(message);
        const wsViewer = onlineUsers.get(socketId);
        if (wsViewer && wsViewer?.ws?.readyState === WebSocket.OPEN) {
            wsViewer.ws.send(JSON.stringify(payload));
        }
    });
    await events.subscribe('join-stream', data => {
        const { type, stream_id, user_id, message } = JSON.parse(data);
        const viewers = Array.from(viewStream.values()).filter(items => items?.stream_id === stream_id && items?.id !== user_id);
        viewers.forEach((items: any) => {
            if(items?.ws && items?.ws.readyState === WebSocket.OPEN){
                items.ws.send(JSON.stringify({ type, message }));
            }
        });
    });
    await events.subscribe('out-stream', data => {
        const { type, stream_id, message } = JSON.parse(data);
        const viewers = Array.from(viewStream.values()).filter(items => items?.stream_id === stream_id);
        viewers.forEach((items: any) => {
            if(items?.ws && items?.ws.readyState === WebSocket.OPEN){
                items.ws.send(JSON.stringify({ type, message }));
            }
        });
    });
    await events.subscribe('end-stream', async data => {
        const { type, stream_id, message } = JSON.parse(data);
        const viewers = Array.from(viewStream.values()).filter(items => items?.stream_id === stream_id);
        viewers.forEach((items: any) => {
            if(items?.ws && items?.ws.readyState === WebSocket.OPEN){
                items.ws.send(JSON.stringify({ type, message }));
            }
        });
        for (const [key, value] of viewStream.entries()) {
            if (value?.stream_id === stream_id) {
              viewStream.delete(key);
            }
        }
        await redisClient.del(`comment-stream-${stream_id}`);
    });
    await events.subscribe('new-comment', data => {
        const { type, stream_id, commentList } = JSON.parse(data);
        const viewers = Array.from(viewStream.values()).filter(items => items?.stream_id === stream_id);
        viewers.forEach((items: any) => {
            if(items?.ws && items?.ws.readyState === WebSocket.OPEN){
                items.ws.send(JSON.stringify({ type, commentList }));
            }
        });
    });
    await events.subscribe('delete-comment', data => {
        const { type, stream_id, commentList } = JSON.parse(data);
        const viewers = Array.from(viewStream.values()).filter(items => items?.stream_id === stream_id);
        viewers.forEach((items: any) => {
            if(items?.ws && items?.ws.readyState === WebSocket.OPEN){
                items.ws.send(JSON.stringify({ type, commentList }));
            }
        });
    });
    await events.subscribe('donate', data => {
        const { type, stream_id, value, content, user } = JSON.parse(data);
        const viewers = Array.from(viewStream.values()).filter(items => items?.stream_id === stream_id);
        viewers.forEach((items: any) => {
            if(items?.ws && items?.ws.readyState === WebSocket.OPEN){
                items.ws.send(JSON.stringify({ type, value, content, user }));
            }
        });
    });
}
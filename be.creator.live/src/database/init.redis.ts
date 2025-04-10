import { createClient, RedisClientType } from "redis";

import { REDIS_CONNECT_MESSAGE, REDIS_CONNECT_TIMEOUT, statusRedis } from "~/config/redis";

const connectionTimeout: { current?: NodeJS.Timeout } = {};

const handleTimeoutError = () => {
    connectionTimeout.current = setTimeout(() => {
        throw new Error(REDIS_CONNECT_MESSAGE.message);
    }, REDIS_CONNECT_TIMEOUT);
};

const handleEventConnect = (connectionRedis: RedisClientType) => {
    connectionRedis
        .on(statusRedis.CONNECT, () => {
            console.log("Redis: Connected", new Date().toString());
            clearTimeout(connectionTimeout.current);
        })

        .on(statusRedis.END, () => {
            console.log("Redis: disconnected", new Date().toString());
            if (!!!connectionTimeout.current) handleTimeoutError();
        })

        .on(statusRedis.RECONNECT, () => {
            console.log("Redis: reconnecting", new Date().toString());
            if (!!!connectionTimeout.current) handleTimeoutError();
        })

        .on(statusRedis.ERROR, (err) => {
            console.log("Redis: error", err, new Date().toString());
            if (!!!connectionTimeout.current) handleTimeoutError();
        })
        .connect();
};

const redis: RedisClientType = createClient({ database: 1 });
handleEventConnect(redis);

// (async () => {
//     const redis = createClient({ database: 1 });
//     redisClient.intansce = redis;
//     handleEventConnect(redis);
// })();
export default redis;

export const statusRedis = {
    CONNECT: "connect",
    END: "end",
    RECONNECT: "reconnecting",
    ERROR: "error",
};

export const REDIS_CONNECT_TIMEOUT = 10000;

export const REDIS_CONNECT_MESSAGE = {
    code: -99,
    message: "Connect Redis failed",
};

export const REDIS_KEYS = {};

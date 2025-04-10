import { createClient } from "redis";
import config from "~/config";

const redisClient = createClient({
    socket: {
      host: config.Database.host,
      port: 6379,
    },
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Redis client connected");
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
  }
};
connectRedis();

export default redisClient;
import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL,
  legacyMode: true, // required for connect-redis
});

redisClient.connect().catch(console.error);

export default redisClient;

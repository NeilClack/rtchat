import { Redis } from "@upstash/redis";

console.log(process.env.UPSTASH_REDIS_REST_URL)

export const db = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    } as any)
 
import {Queue}  from "bullmq";
import { redisConnection } from "./client";
export const shapeQueue = new Queue("shape-draw",{
    connection : redisConnection,
});

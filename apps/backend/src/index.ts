import express from "express";
import { userRouter } from "./routes/user";
import {authRouter} from "./routes/auth";
import cors from "cors";
const app=express();
app.use(express.json());
app.use(cors());

console.log("hello world");
//app.use("/user",userRouter);
app.use("/api/auth",authRouter);
app.listen(3001,()=>{
    console.log("Server listening on port 3001");
})
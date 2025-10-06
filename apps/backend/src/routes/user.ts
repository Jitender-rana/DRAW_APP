import express ,{Request,Response,NextFunction} from "express";
import { userDataValidator } from "../middlewares/userdata";
export const userRouter=express.Router();
userRouter.post("/signup",userDataValidator,(req:Request,res:Response)=>{
    res.json({
        message:"User created successfully",
    })

})


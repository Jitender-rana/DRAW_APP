import express,{Request,Response} from "express";
import axios from "axios";
import { GoogleTokenResponse } from "../utils/googleutils";
import {prismaClient as prisma} from "@repo/db-package";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend";
import dotenv from "dotenv";
dotenv.config();

import {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    
    
    GOOGLE_TOKEN_URL,
    GOOGLE_USERINFO_URL
} from "../utils/googleutils";

type user={
    id?: string;
    email: string;
    name?: string;
    

}

const authRouter=express.Router();
authRouter.post("/google",async (req:Request,res:Response)=>{
    console.log("Request reached here from frontend with auth-code");
    const {code}=req.body;
    console.log(code);
    if(!code){
        res.json({
            message: "auth-code not provided by the frontend",
            
        })
        return;

    }
    try{

        console.log("sending request to google call back");
        console.log(GOOGLE_CLIENT_ID);
        const tokenResponse = await axios.post<GoogleTokenResponse>(GOOGLE_TOKEN_URL,{
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri:  'postmessage',
            grant_type: "authorization_code"
        },{
            headers: { "Content-Type": "application/json" }
        })
        console.log(`The token response data is :${tokenResponse.data}`);
        const { access_token } = tokenResponse.data;
        
        const userResponse = await axios.get<user>(GOOGLE_USERINFO_URL, {
            headers: { Authorization: `Bearer ${access_token}` }
        });
        console.log(`Then userreponse data is :${userResponse.data}`);
        const user = userResponse.data;
        
        //console.log(`the user is : ${JSON.stringify(user)}`);
        let existingUser= await prisma.user.findUnique({
            where: {email: user.email},
        })

        if(!existingUser){
            existingUser=await prisma.user.create({
                data:{
                    email: user.email,
                    name: user.name || "",

                },
            })
        }

        const token=jwt.sign({
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name
        },JWT_SECRET)

        

    }catch(error: any){
        console.error("Google Auth Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Authentication failed" });
        return;


    }


})
export  {authRouter};
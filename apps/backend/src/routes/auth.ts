import express,{Request,Response} from "express";
import axios from "axios";
import { GoogleTokenResponse } from "../utils/googleutils";
import dotenv from "dotenv";
dotenv.config();

import {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    
    
    GOOGLE_TOKEN_URL,
    GOOGLE_USERINFO_URL
} from "../utils/googleutils";

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
        
        const userResponse = await axios.get(GOOGLE_USERINFO_URL, {
            headers: { Authorization: `Bearer ${access_token}` }
        });
        console.log(`Then userreponse data is :${userResponse.data}`);
        const user = userResponse.data;
        
        console.log(`the user is : ${JSON.stringify(user)}`);

    }catch(error){

    }


})
export  {authRouter};
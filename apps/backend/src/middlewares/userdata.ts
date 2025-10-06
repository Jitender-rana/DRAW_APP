import { Request,Response,NextFunction } from "express";
import {z} from "zod";
const mySchema=z.object({
    email: z.string().email({message: "Invalid email format"}),
    password: z.string().min(1,{message: "Password is reuired"})
})
type Mydata=z.infer<typeof mySchema>;
export function userDataValidator(req:Request,res:Response,next:NextFunction){
    try{
        req.body=mySchema.parse(req.body);
        next();

    }catch(error){
        console.log("there is some error while handlig user request : userdatavalidator");
        
        if(error instanceof z.ZodError){
            console.log(error);
            
            console.log(`the error is :  ${(JSON.parse(error.message))}`);
            res.json({
                message: "validation error",
                error: JSON.parse(error.message),
            })
            return;
        }
        res.status(500).json({                          
            message:   "unexpected error occured while parsing" 
        })
        return;

    }
}
import {WebSocketServer,WebSocket} from "ws";
import { prismaClient } from "@repo/db-package/client";
import { JWT_SECRET } from "@repo/backend/config";
import { shapeQueue } from "@repo/redis-client/queue";
import jwt from "jsonwebtoken";

const wss = new WebSocketServer({port: 8080});
const SocketToUser =  new Map<WebSocket,string>();
const UserRooms = new Map<string,Set<number>>();
const RoomSockets = new Map<number,Set<WebSocket>>();




function checkUser(token: string): string | null{
    try{
        const decoded=jwt.verify(token,JWT_SECRET) as jwt.JwtPayload;
        if(!decoded || typeof decoded !=="object" || !decoded.id ){
            return null;
        }
        return decoded.id as string;
    }catch(error){
        console.log(error);
        return null;
    }

}
wss.on("connection",(ws,request)=>{
    const url = request.url;
    if(!url)return;
    const queryParams = new URLSearchParams(url.split("?")[1]);
    const token=queryParams.get("token")|| "";
    console.log(token);
    const userID=checkUser(token);
    if(!userID){
        ws.close();
        return;

    }
    SocketToUser.set(ws,userID);
    if (!UserRooms.has(userID)) {//agar user pehle se exist nhi karta to naya set bna do
    UserRooms.set(userID, new Set());
    }
    
    ws.on("message",async(data)=>{
        const parsedData= typeof data ==="string"? JSON.parse(data): JSON.parse(data.toString());
        if(parsedData.type==="join_room"){
            const roomId=Number (parsedData.roomId);
            UserRooms.get(userID)?.add(roomId);
            if(!RoomSockets.has(roomId)){
                RoomSockets.set(roomId,new Set());
            }
            RoomSockets.get(roomId)?.add(ws);
        }
        if(parsedData.type==="leave_room"){
            const roomID=Number (parsedData.roomId);
            UserRooms.get(userID)?.delete(roomID);//user ke rooms set se room hata do
            RoomSockets.get(roomID)?.delete(ws);//us user ke socket ko room se hata do
            if(RoomSockets.get(roomID)?.size===0){//if no sockets are left in the room, delete the room entry,ek bhi user nhi bacha room me
                RoomSockets.delete(roomID);


            }
            
        }
        if(parsedData.type==="shape:draw"){
            const roomId=Number (parsedData.roomId);
            const ShapeData=parsedData.ShapeData;
            //JSON.stringify(ShapeData);
            // await prismaClient.shape.create({
            //     data:{
            //         roomId:roomId,
            //         userId:userID,
            //         cordinates: JSON.stringify(ShapeData)
            //     }
            // })
            await shapeQueue.add("shapeDrawJob",{
                roomId:roomId,
                userId:userID,
                cordinates: JSON.stringify(ShapeData)
            });
            const sockets=RoomSockets.get(roomId);
            sockets?.forEach((client)=>{//Sabhi other clients ko bhejna hai
                if(client!==ws && client.readyState===WebSocket.OPEN){
                    client.send(JSON.stringify({
                        type:"shape:draw",
                        ShapeData:ShapeData,
                        roomId:roomId,
                        userId:userID
                    }))
                }
            })
        }


    })
    ws.on("close",()=>{
        const userId=SocketToUser.get(ws);
        if(!userId)return;
        const rooms=UserRooms.get(userId);
        if(!rooms)return;
        rooms.forEach((roomId)=>{//sabhi rooms se user ke ws  object ko delete karna hai
            RoomSockets.get(roomId)?.delete(ws);
            if(RoomSockets.get(roomId)?.size===0){
                RoomSockets.delete(roomId);
            };
        })
        //UserRooms.delete(userId);If a user opens multiple tabs / connections, closing one socket will delete all rooms for that user, even though other sockets may still be active.
        SocketToUser.delete(ws);

    })



})





import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import axios from 'axios';
const BACKEND_URL=import.meta.env.VITE_BACKEND_URL;



export function GoogleLogin(){
  const [loading,setloading]=useState<boolean>(false);


  const login=useGoogleLogin({

    flow: 'auth-code',
    onSuccess: async(tokenResponse)=>{
      try {
        const {code}=tokenResponse;
        console.log(code);
        console.log("sending auth-code to backend");
        const response=await axios.post(`${BACKEND_URL}/api/auth/google`,{code})
        const {token}=response.data;
        console.log(token);
      

      }catch(error){

      }
    }

  })


    return <div>
        <button className='bg-blue-500 text-white rounded-md px-4 py-2 cursor-pointer' onClick={()=>{
          setloading(true);
          login()
          }}>Login With Google</button>
    </div>
}
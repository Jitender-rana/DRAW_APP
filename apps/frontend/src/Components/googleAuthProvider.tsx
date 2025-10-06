import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "./googleAuth";
const CLIENT_ID=import.meta.env.VITE_CLIENT_ID;
export function AuthProvider() {


  return<GoogleOAuthProvider clientId={CLIENT_ID}>
      <GoogleLogin/>
    </GoogleOAuthProvider>;
  
}

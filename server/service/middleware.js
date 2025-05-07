import { getUser,setUser } from "./auth.js";
import User from "../models/register.js"


export const authenticate = async(req , res ,next)=>{
  const token = req.cookies.token;
  const userId = getUser(token);
  console.log("token from authh",userId)
  if(!token){
    return res.status(401).json({message: 'Authentication required - No token'})
  }
  try{
    const userId = getUser(token);
    const userEmail = userId.email;
    if(!userId){
      return res.status(401).json({message: 'Authentication required - Invalid token'})
    }
    const user = await User.findOne({email : userEmail});
    if(!user){
      return res.status(401).json({message: 'Authentication required - user not found'})
    }
    req.user = user;
    next();
  }
  catch(error){
    console.error("token error",error);
    return res.status(401).json({message: 'Authentication required - No token'})
  }
};
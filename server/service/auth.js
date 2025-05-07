import jwt from "jsonwebtoken";

const secretKey = "asad@nsaridev";

const setUser = (user) =>{
  console.log("token created")
  return jwt.sign({
    email:user.email,
    isLogin:true,
    _id:user._id,
  } , secretKey);
}

const getUser = (token) =>{
  if(!token) return null;
  return jwt.verify(token,secretKey);
}

export {setUser,getUser};
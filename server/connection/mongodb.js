import mongoose from "mongoose";

const connect = () => mongoose.connect("mongodb+srv://mrxastra:ansari99@cluster0.l8znmyc.mongodb.net/fliper").then(()=>{
  console.log("Connected to MongoDb");
}).catch((e)=>{
  console.error("Error connecting Mongodb ",e);
})

export default connect;
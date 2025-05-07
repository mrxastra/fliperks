import { profile } from "console";
import mongoose from "mongoose";
import { report } from "process";

const user = new mongoose.Schema({
  name : String,
  email : {type : String, unique : true},
  phoneNumber : {type : Number, unique : true},
  totalPosts : Number,
  profileImage : String,
  location : String,
  premium : {type: String, default : "false"},
  phoneVerified :{type: Boolean, default : false},
  report : String,
  password : String,
  joinDate : Date,
});

const User = mongoose.model("user",user);
export default User;


// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//   name: String,
//   email: { type: String, unique: true },
//   password: String, 
//   loginAttempts: { type: Number, default: 0 },
//   lastFailedAttempt: { type: Date },
//   lockUntil: { type: Date },
// });

// const User = mongoose.model('User', userSchema);

// export default User;
import mongoose from "mongoose";

const ad = new mongoose.Schema({
  category : String,
  subCategory : String,
  name : String,
  description : String,
  price : Number,
  location : String,
  owner : String,
  images : { type: [String], default: [] },
  expiry : Date,
  created : Date,
  repoart : String,
  rating : Number,
});

const Ad = new mongoose.model('ad',ad);

export default Ad;
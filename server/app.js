import express from 'express';
import { createServer } from 'http';
import {Server} from 'socket.io';
import cors from 'cors';
import bodyParser from 'body-parser';
import connect from './connection/mongodb.js';
import User from './models/register.js';
import Ad from './models/createAd.js'
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import {setUser, getUser} from './service/auth.js'
import cookieParser from 'cookie-parser';
import { authenticate } from './service/middleware.js';
import { error } from 'console';
import {v2 as cloudinary} from 'cloudinary'
import 'dotenv/config';
import multer from 'multer';
import uploadRoute from './routes/uploadRoute.js'
const port = 4000;
const app = express();
const server = createServer(app);
cloudinary.config({
  cloud_name :'doi35abfh',
  api_key : process.env.API_KEY,
  api_secret : process.env.API_SECRET,
  // secure : true

})

// const storage = multer.memoryStorage();
// const uploadMiddleware = multer({storage:storage}).single('image');


app.use(cors({
  origin:"http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true,
}));

// app.use('/api/upload',uploadMiddleware)
app.use('/api',uploadRoute)



app.use(cookieParser());
app.use(bodyParser.json())
connect();
const io = new Server(server,{
  cors:{
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});


app.post('/register',async(req,res)=>{
  const {name,email,password,phoneNumber} = req.body;
  const verifyEmail = await User.findOne({email});
  const verifyPhone = await User.findOne({phoneNumber});
  if(verifyEmail || verifyPhone){
    console.log("Email or Phone is already register",email);
  }
  else{
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password,salt);
    const user = new User({name,email,password:hashedPassword,phoneNumber,joinDate:new Date(Date.now())});
    await user.save();
    console.log("name : ",name,"email :",email,"password :",password);
    return res.status(200).json({ message: 'Login successful' });
  }
  
})

app.get('/authenticate', authenticate,(req,res)=>{
  res.status(200).json({message:'success'});
});


app.get('/connection', authenticate, (req,res)=>{
  res.json({message : 'You are authorized', user: req.user});
});

app.post('/logout', (req, res) => {
  res.clearCookie('token', { path: '/' }); // Clear the cookie on the server
  res.status(200).json({ message: 'Logged out' });
  console.log("done cookie deleting")
});

app.get('/api/myposts',async(req,res)=>{
  const token = req.cookies.token;
  const userId = getUser(token);
  const owner = userId._id;
  const result = await Ad.find({owner});
  console.log("myposts result",result)
  return res.json(result);
})

app.get('/api/profile', async (req,res)=>{
  const token = req.cookies.token;
  const userId = getUser(token);
  if(!token){
    return res.status(401).json({message: 'Authentication required - No token'})
  }
    const userEmail = userId.email;
  const verify = await User.findOne({email:userEmail});
  if(verify){
    return res.json(verify);
  }
  else{
    console.log("error in profile data");
  }
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = setUser(user);
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 60*24*60*60*1000,
        path: '/'
      });
      return res.status(200).json({ message: 'Login successful' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/images',(req,res)=>{
  cloudinary.config({
    cloud_name :'doi35abfh',
    api_key : process.env.API_KEY,
    api_secret : process.env.API_SECRET,
    secure : true
  
  })

  // (async function(){
  //   const result = await cloudinary.uploader.upload('./images/any')
  //   console.log(result);
  //   const url = cloudinary.url(result.public_id,{
  //     transformation:[
  //       {
  //         quality:'auto',
  //       }
  //     ]
  //   })
  // })
  
  const url = cloudinary.url('Home/yaole37ccimhbwaz0bfp',{
    transformation:[
      {
        fetch_format: 'auto',
        quality:'auto',
      }
    ]
  })
  console.log(url)
})


// const storage = multer.memoryStorage();
// const upload = multer({storage:storage});

// app.post('/api/upload',upload.single('image'),async(req,res) =>{
//   const token = req.cookies.token;
//   const userId = getUser(token);
//   const owner = userId._id;
//   console.log("useeeeeeeee",owner);
//   // console.log("token from authh",userId)
//   if(!req.file){
//     return res.status(401).json({message: 'Authentication required - No token'})
//   }
//   if(!token){
//     return res.status(401).json({message: 'Authentication required - No token'})
//   }
//   // const { category,name,description,location,price,imageData } = req.body;
//   // console.log("image data",imageData)
//   const result = await cloudinary.uploader.upload(req.file.buffer,{
//     folder:'my-uploads'
//   })
//   res.json(result)
//     // console.log("result :",result);
//     // const url = cloudinary.url(result.public_id,{
//     //   transformation:[
//     //     {
//     //       quality:'auto',
//     //     }
//     //   ]
//     // })
//     // console.log("urll",url);
//   // const created = new Date();   
//     // const ad = new Ad({category,name,description,location,price,created,owner});
//     // await ad.save();
//     // console.log("ad uploaded",name);
//     // return res.status(200).json({ message: 'Uploaded Success' });
//   // }
// })

app.post('/api/uploadss',async(req,res) =>{
  const token = req.cookies.token;
  const userId = getUser(token);
  const owner = userId._id;
  console.log("useeeeeeeee",owner);
  // console.log("token from authh",userId)
  if(!token){
    return res.status(401).json({message: 'Authentication required - No token'})
  }
  const { category,name,description,location,price } = req.body;
  const created = new Date();   
    const ad = new Ad({category,name,description,location,price,created,owner});
    await ad.save();
    console.log("ad uploaded",name);
    return res.status(200).json({ message: 'Uploaded Success' });
  // }
})
async function searchVideosFromMongoDB(query, page, limit) {
  try {
    const skip = page * limit;
    const results = await Ad.find({

    })
      .skip(skip)
      .limit(limit)
      // .exec();
    console.log("results",page,limit)
    return results;
  } catch (error) {
    console.error('Error searching videos from MongoDB:', error);
    throw error;
  }
}
app.get('/api/allposts', async (req, res) => {
  const { q, page = '0', limit = '2' } = req.query;
  console.log("query",page);
  const query = Array.isArray(q) ? q[0] : q || '';
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  console.log("query",pageNumber,limit,q);

  if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 0 || limitNumber <= 0) {
    return res.status(400).json({ error: 'Invalid page or limit parameters' });
  }

  try {
    const videos = await searchVideosFromMongoDB(query, pageNumber, limitNumber);
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch search results from MongoDB' });
  }
});


app.get('/api/adpost',async(req,res)=>{
  const _id = req.query.id;
  // console.log("iiiid",id)
  if(!_id){
    return res.status(400).json({error: 'Login prblem please try again.'})
  }
  const result = await Ad.findOne({_id})
  if(result){
    return res.status(200).json(result);
  }
  return res.status(500).json({error:'failed to fetch the data.'})

})




async function searchProducts(query) {
  try {
    const results = await Ad.find({
      $or: [ // Search across multiple fields
        { name: { $regex: query, $options: 'i' } }, // 'i' for case-insensitive
        { description: { $regex: query, $options: 'i' } },
        // Add more fields to search as needed
      ],
    });
    return results;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
}

// Example usage in a route handler:
app.get('/api/search', async (req, res) => {
  const searchQuery = req.query.q || '';
  try {
    const products = await searchProducts(searchQuery);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search products' });
  }
});






// app.get('/api/adpostsss',async(req,res)=>{
//   const ads = await Ad.find({});
//   if(ads){
//     res.send(ads);
//   }
//   else{
//     console.log("error fetching adds");
//   }
// })


io.on("connection",(socket)=>{
  console.log("user connected","Id:", socket.id)
  socket.emit("welcome",`welcomet to the server ${socket.id}`);

  socket.on("message",(e,i)=>{
    socket.to(i).emit("smessage",e);
      console.log("message is :",e,"id :",i)
    })
})

server.listen(port,()=>{
  console.log("Working server");
})
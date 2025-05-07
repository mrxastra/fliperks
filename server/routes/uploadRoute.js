import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';
import { getUser } from '../service/auth.js';
import { error } from 'console';
import Ad from '../models/createAd.js';

// const router = express.Router();
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// router.post('/upload', upload.single('image'), async (req, res) => {
//   const token = req.cookies.token;
//   const userId = getUser(token);
//   const owner = userId?._id; // Use optional chaining in case userId is null
//   console.log("useeeeeeeee", owner);

//   if (!req.file) {
//     return res.status(400).json({ message: 'No image file provided.' });
//   }
//   if (!token) {
//     return res.status(401).json({ message: 'Authentication required - No token' });
//   }

//   const result = await cloudinary.uploader.upload(req.file.buffer, {
//     folder: 'my-uploads'
//   });
//   res.json(result);
// });

// export default router;


const router = express.Router();


const storage = multer.diskStorage({
  filename:function(req,file,cb){
    cb(null,file.originalname)
  }
})
const uploadMiddleware = multer({storage:storage}).single('image');



router.post('/upload',uploadMiddleware,async(req,res) =>{
  const token = req.cookies.token;
  const userId = getUser(token);
  const owner = userId._id;
  if(!req.file){
    console.log('result',req.file?.path)
    return res.status(401).json({message: 'Authentication required - No token'})
  }
  if(!token){
    return res.status(401).json({message: 'Authentication required - No token'})
  }
  const { category,name,description,location,price,imageData } = req.body;
  console.log("image data",imageData)
  try{

    const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'Home'
        });
    console.log('resulsst',result)
    res.json(result)
  }catch{
    console.log('cloudinary uplaod error',error);
    res.status(500).json({error:'failed to upload image to cloudinary'})
  }
    console.log("result :",result);
    const url = cloudinary.url(result.public_id,{
      transformation:[
        {
          quality:'auto',
        }
      ]
    })
    console.log("urll",url);
  const created = new Date();   
    const ad = new Ad({category,name,description,location,price,created,owner});
    await ad.save();
    console.log("ad uploaded",name);
    return res.status(200).json({ message: 'Uploaded Success' });
  // }
})

export default router;
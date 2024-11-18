import multer from 'multer';
import {CloudinaryStorage } from 'multer-storage-cloudinary';
import {v2 as cloudinary} from 'cloudinary';
import configKeys from '../config/configKeys.js';


cloudinary.config({
    cloud_name: configKeys.CLOUDINARY_CLOUD_NAME,
    api_key: configKeys.CLOUDINARY_API_KEY,
    api_secret: configKeys.CLOUDINARY_SECRET_KEY
})

const chatFileOptions = {
    cloudinary,
    params:(req,file)=>{
        const { roomId, type } = req.body;
        return {
            folder: `chats/${roomId}/${type}`,
            resource_type: 'auto',
            public_id: `chat-${Date.now()}-${file.originalname.split(".")[0]}`
        }
    }
}

const chatFileUploadStorage = new CloudinaryStorage(chatFileOptions)
export const uploadChatFile = multer({storage:chatFileUploadStorage }).single('file')


const profilePicOptions = {
    cloudinary,
    params:(req,file)=>{
        return {
            folder: `ProfilePics`,
            resource_type: 'image',
            allowed_formats : ["jpg","jpeg","png","bmp","tiff","tif","svg","webp","heic"],
            transformation: [{ quality: '50' }],
            public_id: `image-${Date.now()}-${file.originalname.split(".")[0]}`
        }
    }
}

const profilePicStorage = new CloudinaryStorage(profilePicOptions)
export const uploadProfilePic = multer({storage:profilePicStorage }).single('image')


const bannerOptions = {
    cloudinary,
    params:(req,file)=>{
        return {
            folder: `banners`,
            resource_type: 'image',
            allowed_formats : ["jpg","jpeg","png","bmp","tiff","tif","svg","webp","heic","avif"],
            transformation: [{ quality: '80' }],
            public_id: `banner-${Date.now()}-${file.originalname.split(".")[0]}`
        }
    }
}

const bannerStorage = new CloudinaryStorage(bannerOptions)
export const uploadBanner = multer({storage:bannerStorage }).single('banner')



// allowed_formats : ["jpg","jpeg","png","gif","bmp","tiff","tif","svg","webp","heic","txt"],
// resource_type: file.mimetype.startsWith('image/') ? 'image' : file.mimetype.startsWith('video/') ? 'video' : 'raw',
// transformation: [{ width: 500, height: 500, crop: 'limit' },{ quality: '60' }],
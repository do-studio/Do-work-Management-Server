import {config} from 'dotenv'
config()

const configKeys = {
    PORT:process.env.PORT,
    MONGODB_ATLAS_URL:process.env.MONGODB_ATLAS_URL,
    CLOUDINARY_CLOUD_NAME:process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY:process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_SECRET_KEY:process.env.CLOUDINARY_SECRET_KEY,
    CLIENT_URL:process.env.CLIENT_URL,
    JWT_ACCESS_SECRET_KEY:process.env.JWT_ACCESS_SECRET_KEY,
    JWT_REFRESH_SECRET_KEY:process.env.JWT_REFRESH_SECRET_KEY,
    JWT_ACCESS_EXPIRY:process.env.JWT_ACCESS_EXPIRY,
    JWT_REFRESH_EXPIRY:process.env.JWT_REFRESH_EXPIRY,
    JWT_USER_ROLE:process.env.JWT_USER_ROLE,
    JWT_ADMIN_ROLE:process.env.JWT_ADMIN_ROLE
}

export default configKeys
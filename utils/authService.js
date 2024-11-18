import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import configKeys from '../config/configKeys.js'

const authService = {
    encryptPassword:async(password)=>{
        const salt = await bcrypt.genSalt(10)
        return await bcrypt.hash(password,salt)
    },
    comparePassword:async(password,hashedPassword)=>{
        return await bcrypt.compare(password,hashedPassword)
    },
    generateToken:(payload,secretKey)=>{
        const expiry = (secretKey == configKeys.JWT_ACCESS_SECRET_KEY) ? configKeys.JWT_ACCESS_EXPIRY : configKeys.JWT_REFRESH_EXPIRY

        return jwt.sign(payload,secretKey,{
            expiresIn: expiry
        })

        // return jwt.sign(payload,secretKey,{
        //     expiresIn: aexpiry
        // })
    },
    verifyToken:(token,secretKey)=>{
        const userData = jwt.verify(token,secretKey,{ignoreExpiration:true})
        if(userData.exp != undefined){
            const currentTimeInSeconds = Math.floor(Date.now() / 1000)
            if(userData.exp >= currentTimeInSeconds){
                return {
                    status:true,
                    payload:userData
                }
            }else{
                return {
                    status:false,
                    payload:userData
                }
            }
        }
    }
}

export default authService
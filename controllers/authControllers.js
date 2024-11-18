import authHelpers from '../helpers/authHelpers.js';
import authService from '../utils/authService.js';
import configKeys from '../config/configKeys.js';
import tokenHelpers from '../helpers/tokenHelpers.js';
import Joi from "joi"

const authControllers = () => {

    const signUp = async (req, res) => {
        try {
            const userSchema = Joi.object({
                userName: Joi.string().min(6).max(12).required(),
                email: Joi.string().email({tlds:{allow:false}}).required(),
                password: Joi.string().min(6).max(12).required()
            })
            const { error, value } = userSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }

            const { userName, email, password } = value;
            const lowerCaseUserName = userName.toLowerCase()
            const lowerCaseEmail = email.toLowerCase()
            
            const userExists = await authHelpers.getUserByEmail(lowerCaseEmail)
            
            if(userExists){
                return res.status(200).json({ status: false, message: "User exists. Contact admin" });
            }
            
            const userNameExists = await authHelpers.getUserByUserName(lowerCaseUserName)
            
            if(userNameExists){
                return res.status(200).json({ status: false, message: "User name exists"});
            }

            const hashedPassword = await authService.encryptPassword(password)
            const response = await authHelpers.signUp(lowerCaseUserName, lowerCaseEmail, hashedPassword);
            if (response) {
                return res.status(200).json({ status: true, message: "Registration successfull" });
            } else {
                return res.status(200).json({ status: false, message: "Error in Registration" });
            }
        } catch (error) {
            throw new Error(error.message)
        }
    }

    const signIn = async (req, res) => {
        try {
            const signInSchema = Joi.object({
                email: Joi.string().email({tlds:{allow:false}}).required(),
                password: Joi.string().min(6).max(12).required()
            })
            const { error, value } = signInSchema.validate(req.body)
            
            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            const { email, password } = value
            const lowerCaseEmail = email.toLowerCase()

            const registration = async (user, role) => {
                const checkPassword = await authService.comparePassword(password, user.password)
                if (!checkPassword) {
                    return res.status(200).json({ status: false, message: "Incorrect Password" })
                }
                const payload = {
                    id: user._id,
                    role
                }
                const accessToken = authService.generateToken(payload, configKeys.JWT_ACCESS_SECRET_KEY)
                const refreshToken = authService.generateToken(payload, configKeys.JWT_REFRESH_SECRET_KEY)

                try {
                    if (refreshToken.length) {
                        const refreshTokenToDb = await tokenHelpers.addToken(user._id, refreshToken)

                        if (refreshTokenToDb) {
                            const data = {
                                _id: user._id,
                                userName: user.userName,
                                email: user.email,
                                notificationUnreadCount: user.notificationUnreadCount,
                                role: user.role
                            }
                            if (role === configKeys.JWT_USER_ROLE) {
                                data.permissions = user.permissions
                            }

                            return res.status(200).json({ status: true, token: accessToken, message: "Signin success", data })
                        }
                    }
                } catch (error) {
                    throw new Error(`Error creating session: ${error.message}`);
                }
            }

            const userExists = await authHelpers.getUserByEmail(lowerCaseEmail)
            if (userExists) {
                if(userExists.role === configKeys.JWT_ADMIN_ROLE){
                    registration(userExists, configKeys.JWT_ADMIN_ROLE)
                }else if(userExists.role === configKeys.JWT_USER_ROLE){
                    if(userExists.isActive){
                        registration(userExists, configKeys.JWT_USER_ROLE)
                    }else{
                        return res.status(200).json({ status: false, message: "Contact Admin for access" })
                    }
                }
            } else {
                return res.status(200).json({ status: false, message: "User does not exist" })
            }
        } catch (error) {
            return res.status(500).json({ status: false, message: "Error occured" })
        }
    }


    const signOut = async (req, res) => {
        const { id } = req.payload
        const deleteToken = await tokenHelpers.deleteToken(id)
        if (deleteToken) {
            return res.status(200).json({ status: true, message: "Signout Successful" })
        }
    }


    return {
        signUp,
        signIn,
        signOut
    }
}

export default authControllers;
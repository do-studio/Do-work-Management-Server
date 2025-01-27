import authHelpers from '../helpers/authHelpers.js';
import authService from '../utils/authService.js';
import configKeys from '../config/configKeys.js';
import tokenHelpers from '../helpers/tokenHelpers.js';
import Joi from "joi"
import UserModel from '../models/user.js';
import OTP from '../models/otpModel.js';
import validator from 'validator';
import bcrypt from "bcrypt"
import { passwordChangedMail, sendOTPMail } from '../utils/mailFunction.js';

const authControllers = () => {

    const signUp = async (req, res) => {
        try {
            const userSchema = Joi.object({
                userName: Joi.string().min(2).max(20).required(),
                email: Joi.string().email({ tlds: { allow: false } }).required(),
                password: Joi.string().min(6).max(20).required()
            })
            const { error, value } = userSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }

            const { userName, email, password } = value;
            const lowerCaseUserName = userName.toLowerCase()
            const lowerCaseEmail = email.toLowerCase()

            const userExists = await authHelpers.getUserByEmail(lowerCaseEmail)

            if (userExists) {
                return res.status(200).json({ status: false, message: "User exists. Contact admin" });
            }

            const userNameExists = await authHelpers.getUserByUserName(lowerCaseUserName)

            if (userNameExists) {
                return res.status(200).json({ status: false, message: "User name exists" });
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
                email: Joi.string().email({ tlds: { allow: false } }).required(),
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
                if (userExists.role === configKeys.JWT_ADMIN_ROLE) {
                    registration(userExists, configKeys.JWT_ADMIN_ROLE)
                } else if (userExists.role === configKeys.JWT_USER_ROLE) {
                    if (userExists.isActive) {
                        registration(userExists, configKeys.JWT_USER_ROLE)
                    } else {
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


    // Incase the user forget the password can reset after verifying otp
    const forgotPassword = async (req, res) => {

        try {
            const { email } = req.body;

            if (!email) {
                throw Error("Provide an Email");
            }

            if (!validator.isEmail(email)) {
                throw Error("Invalid Email");
            }

            const user = await UserModel.findOne({ email });

            if (!user) {
                throw Error("Email is not Registered");
            }

            const otpExists = await OTP.findOne({ email });

            if (otpExists) {
                await OTP.findOneAndDelete({ _id: otpExists._id });
            }

            let otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

            await OTP.create({ email, otp });

            res
                .status(200)
                .json({ msg: "OTP is send to your email Address", success: true });
        } catch (error) {
            console.log(error);

            res.status(400).json({ error: error.message });
        }
    };


    // Validating forgot OTP
    const validateForgotOTP = async (req, res) => {
        try {
            const { email, otp } = req.body;
            console.log(req.body);


            if (!email || !otp) {
                throw Error("All fields are required");
            }

            if (!validator.isEmail(email)) {
                throw Error("Invalid Email");
            }

            const user = await UserModel.findOne({ email });

            if (!user) {
                throw Error("Email is not Registered");
            }

            const validOTP = await OTP.findOne({ email });

            if (otp !== validOTP.otp) {
                throw Error("Wrong OTP. Please Check again");
            }

            res.status(200).json({ success: true, message: "OTP validation Success" });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // Setting up new password
    const newPassword = async (req, res) => {
        try {
            const { email, password, passwordAgain } = req.body;

            if (!email || !password || !passwordAgain) {
                throw Error("All fields are required");
            }

            if (!validator.isEmail(email)) {
                throw Error("Invalid Email");
            }

            if (!validator.isStrongPassword(password)) {
                throw Error("Password is not Strong enough");
            }

            if (password !== passwordAgain) {
                throw Error("Passwords are not same");
            }

            const oldUserData = await UserModel.findOne({ email });

            const match = await bcrypt.compare(password, oldUserData.password);

            if (match) {
                throw Error("Provide new Password");
            }

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            const user = await UserModel.findOneAndUpdate(
                { email },
                {
                    $set: {
                        password: hash,
                    },
                }
            );

            if (user) {
                try {
                    passwordChangedMail(email);
                } catch (error) {
                    console.log("Error occurred while sending email: ", error);
                    throw error;
                }
            }

            return res.status(200).json({ success: true });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // Resending OTP incase the user doesn't receive the OTP
    const resentOTP = async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                throw Error("Email is required");
            }

            if (!validator.isEmail(email)) {
                throw Error("Invalid Email");
            }

            const otpData = await OTP.findOne({ email });

            if (!otpData) {
                throw Error("No OTP found in this email. Try again...");
            }

            if (otpData.otp) {
                sendOTPMail(email, otpData.otp);
            } else {
                throw Error("Cannot find OTP");
            }

            res.status(200).json({ message: "OTP resend successfully", success: true });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    };

    // Sending OTP to email for validation
    const sendOTP = async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                throw Error("Provide an Email");
            }

            if (!validator.isEmail(email)) {
                throw Error("Invalid Email");
            }

            const user = await UserModel.findOne({ email });

            if (user) {
                throw Error("Email is already registered");
            }

            let otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

            const exists = await OTP.findOne({ email });

            if (exists) {
                throw Error("OTP already send");
            }

            await OTP.create({ email, otp });

            res.status(200).json({ success: true, message: "OTP sent Successfully" });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    // Validating above OTP
    const validateOTP = async (req, res) => {
        const { email, otp } = req.body;

        try {
            const data = await OTP.findOne({ email });

            if (!data) {
                throw Error("OTP expired");
            }

            if (otp !== data.otp) {
                throw Error("OTP is not matched");
            }

            res.status(200).json({
                success: true,
                message: "OTP validation Success",
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };



    return {
        signUp,
        signIn,
        signOut,
        forgotPassword,
        validateForgotOTP,
        newPassword,
        resentOTP,
        validateOTP,
        sendOTP

    }
}

export default authControllers;
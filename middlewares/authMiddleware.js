import configKeys from "../config/configKeys.js";
import tokenHelpers from "../helpers/tokenHelpers.js";
import authService from "../utils/authService.js";


const authMiddleware = async (req, res, next) => {
    let token = null
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }
    try {
        if (typeof token == "string") {
            const response = authService.verifyToken(token, configKeys.JWT_ACCESS_SECRET_KEY)
            if (response?.status) {
                req.payload = response.payload
                next()
            } else {
                const tokenResponse = await tokenHelpers.getToken(response.payload.id)
                if (tokenResponse) {
                    const newAccessToken = authService.generateToken({ id: response.payload.id, role: response.payload.role }, configKeys.JWT_ACCESS_SECRET_KEY)
                    return res.status(401).json({ token: newAccessToken })
                } else {
                    return res.status(403).json({ message: "Session expired. Please login" })
                }
            }
        } else {
            return res.status(403).json({ message: "Token not found" })
        }
    } catch (error) {
        return res.status(403).json({ message: "Session expired" })
    }
}


export default authMiddleware
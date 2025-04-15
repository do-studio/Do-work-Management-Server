import userHelpers from '../helpers/userHelpers.js'
import permissionHelpers from '../helpers/permissionHelpers.js'
import bannerHelpers from '../helpers/bannerHelpers.js'


const userControllers = () => {
    const getSingleUser = async (req,res)=>{
        try {
            const {id} = req.params;
            console.log("id",id)
            const response = await userHelpers.getUserData(id)
            console.log(response)
            if(response){
                return res.status(200).json({status:true,data:response})
            }


        } catch (error) {
            throw new Error(error.message);
        }
    }
    const getUserData = async (req,res)=>{
        try {
            const {id} = req.payload
            const response = await userHelpers.getUserData(id)
            if(response){
                return res.status(200).json({status:true,data:response})
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const getActiveBanner = async (req,res)=>{
        try {
            const response = await bannerHelpers.findCurrentBanner()
            if(response){
                return res.status(200).json({status:true,data:response})
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const resetNotifications = async (req,res)=>{
        try {
            const {id} = req.payload
            const response = await userHelpers.resetNotifications(id)
            if(response.modifiedCount){
                return res.status(200).json({status:true})
            }
            return res.status(200).json({status:false,message:"Could not reset notification count"})
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const getUsersAssign = async (req,res)=>{
        try {
            const response = await userHelpers.getUsersForAssign()
            if(response.length){
                return res.status(200).json({status:true,data:response})
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const getPermissions = async (req, res) => {
        try {
            const response = await permissionHelpers.getPermissions()
            return res.status(200).json({status:true,data:response})
        } catch (error) {
            return res.status(500).json({status:false,message:"Internal error"})
        }
    }

    const uploadProfilePic = async (req, res) => {
        try {
            const profilePhotoURL = req.file.path
            const { id } = req.payload

            const response = await userHelpers.uploadProfilePic(id,profilePhotoURL)
            if(response){
                return res.status(200).json({ status: true,data:profilePhotoURL, message: "Profile picture uploaded" })    
            }
            return res.status(200).json({ status: false, message: "Profile picture could not be uploaded" })
        } catch (error) {
            console.error("Error uploading image", error);
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }


    return {
        getUserData,
        getSingleUser,
        getActiveBanner,
        resetNotifications,
        getUsersAssign,
        getPermissions,
        uploadProfilePic
    }
}

export default userControllers;
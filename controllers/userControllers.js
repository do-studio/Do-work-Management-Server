import userHelpers from '../helpers/userHelpers.js'
import permissionHelpers from '../helpers/permissionHelpers.js'
import bannerHelpers from '../helpers/bannerHelpers.js'


const userControllers = () => {
    const getSingleUser = async (req, res) => {
        try {
            const { id } = req.params;
            const response = await userHelpers.getUserData(id)
            if (response) {
                return res.status(200).json({ status: true, data: response })
            }


        } catch (error) {
            throw new Error(error.message);
        }
    }
    const getUserData = async (req, res) => {
        try {
            const { id } = req.payload
            const response = await userHelpers.getUserData(id)
            if (response) {
                return res.status(200).json({ status: true, data: response })
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const getActiveBanner = async (req, res) => {
        try {
            const response = await bannerHelpers.findCurrentBanner()
            if (response) {
                return res.status(200).json({ status: true, data: response })
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const resetNotifications = async (req, res) => {
        try {
            const { id } = req.payload
            const response = await userHelpers.resetNotifications(id)
            if (response.modifiedCount) {
                return res.status(200).json({ status: true })
            }
            return res.status(200).json({ status: false, message: "Could not reset notification count" })
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const getUsersAssign = async (req, res) => {
        try {
            const response = await userHelpers.getUsersForAssign()
            if (response.length) {
                return res.status(200).json({ status: true, data: response })
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const getPermissions = async (req, res) => {
        try {
            const response = await permissionHelpers.getPermissions()
            return res.status(200).json({ status: true, data: response })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }

    const uploadProfilePic = async (req, res) => {
        try {
            // const profilePhotoURL = req.file.path
            const { id } = req.payload

            const profileImgURL = req?.file;
            let imageLink = "";
            if (profileImgURL) {
                console.log("Profile image URL:", profileImgURL);
                imageLink = `${process.env.R2_PUBLIC_ENDPOINT}/${encodeURIComponent(profileImgURL.key)}`;
            }

            const response = await userHelpers.uploadProfilePic(id, imageLink)
            if (response) {
                return res.status(200).json({ status: true, data: imageLink, message: "Profile picture uploaded" })
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
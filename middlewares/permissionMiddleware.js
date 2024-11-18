import configKeys from "../config/configKeys.js"
import permissionHelpers from "../helpers/permissionHelpers.js"
import userHelpers from "../helpers/userHelpers.js"

const permissionMiddleware = (permissionType="")=>{
    return async function(req,res,next){
        const {projectId} = req.params
        const {id,role} = req.payload
        if(role == configKeys.JWT_ADMIN_ROLE){
            return next()
        }
        const permissionExists = await permissionHelpers.getPermissions()
        if(!permissionExists.some(single=>single.key === permissionType && permissionType !== "remove")){
            return next()
        }

        if(role ==  configKeys.JWT_USER_ROLE){
            try {
                const permissionAccess = await userHelpers.getUserPermissions(id)
                if(permissionAccess?.permissions?.length){
                    const projectPermission = permissionAccess.permissions.find((project)=>project.projectId === projectId)
                    if(permissionType === "dynamic"){
                        if(projectPermission?.allowedPermissions?.includes(req.body.field)){
                            return next()
                        }
                    }else if(projectPermission?.allowedPermissions?.includes(permissionType)){
                        return next()
                    }
                }
                return res.status(402).json({status:false,message:"Unauthorized access"})
            } catch (error) {
                return res.status(500).json({status:false,message:"Internal error"})    
            }
        }
        return res.status(402).json({status:false,message:"Unauthorized access"})
    }
}

export default permissionMiddleware
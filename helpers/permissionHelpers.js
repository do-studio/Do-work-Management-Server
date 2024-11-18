import PermissionModel from "../models/permissions.js";


const permissionHelpers = {
  addPermission: async (value) => {
    const newPermission = new PermissionModel(value)
    const savedPermission = await newPermission.save()
    const updated = savedPermission.toObject()
    delete updated.__v
    return updated
  },
  getPermissions: async()=>{
    return await PermissionModel.find({},{__v:0})
  }
}

export default permissionHelpers;
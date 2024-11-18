import HeaderModel from "../models/headers.js";


const headerHelpers = {
  addHeader: async (headerData) => {
    const newHeader = new HeaderModel(headerData)
    const savedHeader = await newHeader.save()
    const updated = savedHeader.toObject()
    delete updated.__v
    return updated
  },
  seedAllHeaders: async (headers) => {
    return await HeaderModel.insertMany(headers)
  },
  findHeaderByName: async (name) => {
    return await HeaderModel.findOne({ name },{_id:1})
  },
  findHeadersCount: async()=>{
    return await HeaderModel.countDocuments()
  },
  headerExists: async()=> await HeaderModel.exists(),
  removeHeader: async(_id)=>{
    return await HeaderModel.deleteOne({_id})
  },
  getAllHeaders: async()=>{
    return await HeaderModel.find({},{__v:0}).sort({order:1})
  },
  getHeadersForAddTask: async()=>{
    return await HeaderModel.find({},{__v:0,width:0}).sort({order:1})
  },
  updateHeaderWidth: async(key,width)=>{
    return await HeaderModel.updateOne({key},{$set:{width}})
  }
}

export default headerHelpers;
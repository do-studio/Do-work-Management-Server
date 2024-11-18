import StatusModel from "../models/status.js";


const statusHelpers = {
  addOption: async (option) => {
    const newOption = new StatusModel(option)
    const savedOption = await newOption.save()
    const updated = savedOption.toObject()
    delete updated.__v
    return updated
  },
  statusExists: async()=>await StatusModel.exists(),
  findOptionByName: async (option) => {
    return await StatusModel.findOne({ option },{_id:1})
  },
  getAllOptions: async()=>{
    return await StatusModel.find({},{__v:0})
  }
}

export default statusHelpers;
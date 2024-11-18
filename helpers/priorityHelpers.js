import PriorityModel from "../models/priorities.js";


const priorityHelpers = {
  addOption: async (option) => {
    const newOption = new PriorityModel(option)
    const savedOption = await newOption.save()
    const updated = savedOption.toObject()
    delete updated.__v
    return updated
  },
  priorityExists: async()=> await PriorityModel.exists(),
  findOptionByName: async (option) => {
    return await PriorityModel.findOne({ option },{_id:1})
  },
  getAllOptions: async()=>{
    return await PriorityModel.find({},{__v:0})
  }
}

export default priorityHelpers;
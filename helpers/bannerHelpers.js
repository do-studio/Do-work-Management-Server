import BannerModel from "../models/banners.js";


const bannerHelpers = {
  addBanner: async (data) => {
    const newBanner = new BannerModel(data)
    const savedBanner = await newBanner.save()
    const updated = savedBanner.toObject()
    delete updated.__v
    return updated
  },
  getBanners: async()=>{
    return await BannerModel.find({isActive:true})
  },
  findCurrentBanner: async()=>{
    return await BannerModel.findOne({isActive:true,currentBanner:true},{_id:1,bannerURL:1})
  },
  selectBanner:async(id,updation)=>{
    return await BannerModel.updateOne({_id:id},{$set:updation})
  },
  removeBanner: async (id) => {
    return await BannerModel.updateOne({_id:id},{ $set:{isActive:false} })
  },
  bannerExists: async()=> await BannerModel.exists(),
  
}

export default bannerHelpers;
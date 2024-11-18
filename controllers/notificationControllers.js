import notificationHelpers from '../helpers/notificationHelpers.js'


const notificationControllers = () => {
    
    const getNotifications = async (req,res)=>{
        try {
            const {skip} = req.params
            const response = await notificationHelpers.getNotifications(Number(skip))
            if(response){
                return res.status(200).json({status:true,data:response})
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }


    return {
        getNotifications
    }
}

export default notificationControllers;
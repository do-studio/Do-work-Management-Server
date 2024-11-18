import {model,Schema} from 'mongoose'

const TokenSchema = new Schema(
    {
        userId: {
            type:String,
            required: true
        },
        token: {
            type: String,
            required: true
        },
        updatedAt:{
            type: Date,
            expires: '30d',
            default: Date.now
        }
    },
    {
        timestamps:true
    }
)

const Token = model('tokens',TokenSchema)
export default Token
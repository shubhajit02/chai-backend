import { asyncHandler} from "../utils/asyncHandler.js"; //dont forget to add .js,it could bring more error


const registerUser=asyncHandler(async (req,res,next)=>{
    return res.status(200).json({
        success:"ok"
    })
})

export {registerUser}
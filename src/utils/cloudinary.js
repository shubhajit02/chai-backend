import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEYS,
    api_secret: process.env.API_SECRET
});

const uploadOnClounary=async (localFilePath)=>{
    try {
        if(!localFilePath) return null
//upload the file on cloudinary
const response=await cloudinary.uploader.upload(localFilePath,{
    resource_type:"auto"
})

//file uploaded successfully
console.log("file uploaded successfully on cloudinary :" +response.url)
return response

    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation got failed
    }
}

export {uploadOnClounary}
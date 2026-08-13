import { v2 as cloudinary } from 'cloudinary'
import { log } from 'console';
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const uploadOnClounary = async (localFilePath) => {
    try {
        console.log("My localFilePath :", localFilePath)
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log(response);
        fs.unlinkSync(localFilePath)

        //file uploaded successfully
        console.log("file uploaded successfully on cloudinary :" + response.url)
        return response

    } catch (error) {
        console.error("CLOUDINARY ERROR:", error);

        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
}

export { uploadOnClounary }
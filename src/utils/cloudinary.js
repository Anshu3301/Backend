import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadFile = async function (filePath) {
    try {
        if (filePath){
           let response = await cloudinary.uploader.upload(filePath, 
                { 
                  public_id: 'shoes',
                  resource_type: "auto",
                }
            )
            console.log(`File Uploaded Successfully! Response:${response}`);
            return response.url;
        }
        else   throw new Error('File Path not Found!');
           
    } catch (error) {
        console.log(error);
        fs.unlinkSync(filePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}


export {uploadFile}


    
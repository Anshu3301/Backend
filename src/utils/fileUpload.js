import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import { ApiError } from './ApiError.js';

// https://console.cloudinary.com/pm/c-1b01ce1ed858c4ccef058c107fa8da/getting-started

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

let currentPublicId;

const fileUpload = async function (filePath) {
    try {
        if (filePath){
            console.log('\nUploading File:',filePath);
            let response = await cloudinary.uploader.upload(filePath,
                { 
                  resource_type: "auto",
                }
            )
            // console.log(`\nResponse:\n${JSON.stringify(response,null,2)}\n`);  // Response: https://cloudinary.com/documentation/upload_images
            fs.unlinkSync(filePath);  // as Uploaded, remove locally saved temporary file
            currentPublicId = response.public_id
            return response.url;
            
        }
        else  throw new ApiError(404,'File Path not Found!');
           
    } catch (error) {
        fs.unlinkSync(filePath); // remove the locally saved temporary file as the upload operation got failed
        return null;
        
    }

    // cloudinary.uploader.upload(filePath, 
    //     { 
    //       resource_type: "auto",
    //     })
    //     .then((resp)=>{console.log(resp.url);})
    //     .catch((err)=> console.log(err))

}


export {fileUpload}


    
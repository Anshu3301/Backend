import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

// https://console.cloudinary.com/pm/c-1b01ce1ed858c4ccef058c107fa8da/getting-started

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const fileUpload = async function (filePath) {
    try {
        if (filePath){
           let response = await cloudinary.uploader.upload(filePath, 
                { 
                  public_id: 'shoes',
                  resource_type: "auto",
                }
            )
            alert('Upload Successful!');
            console.log(`Response:\n${response}`);  // Response: https://cloudinary.com/documentation/upload_images
            fs.unlinkSync(filePath);  // as Uploaded, remove locally saved temporary file
            return response.url;
            
        }
        else  throw new Error('File Path not Found!');
           
    } catch (error) {
        console.log(error);
        fs.unlinkSync(filePath); // remove the locally saved temporary file as the upload operation got failed
        return null;
    }

    // cloudinary.uploader.upload(filePath, 
    //     { 
    //       public_id: 'shoes',
    //       resource_type: "auto",
    //     })
    //     .then((resp)=>{console.log(resp.url);})
    //     .catch((err)=> console.log(err))

}


export {fileUpload}


    
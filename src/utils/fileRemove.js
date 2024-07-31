import { extractPublicId } from 'cloudinary-build-url'
import { v2 as cloudinary } from 'cloudinary';
import { ApiError } from './ApiError.js';

const fileRemove = async(url) =>{
    try {
        const publicId = extractPublicId(url);
        let resp = await cloudinary.uploader.destroy(publicId);
        console.log("Previous File Deleted Successfully!");
    } catch (error) {
        throw new ApiError(400, error.message || "Unable to Remove Previous File!")
    }
}

export {fileRemove}

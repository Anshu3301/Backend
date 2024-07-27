import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';


const verifyToken = asyncHandler(async (req, _, next)=>{  // as the res field isn't used
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
            
        if (!token) {
            throw new ApiError(408, "Unauthorized request");
        }
    
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_PRIVATE_KEY);
        const user = await User.findById(payload?._id).select("-password -refreshToken");  // got ._id as it's provided during Token generation (see user.route.js)
    
        if(!user){
            throw new ApiError(409, "Invalid Access Token!");
        }

        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(409, "Invalid Access Token!");
    }
  }
)

export { verifyToken };

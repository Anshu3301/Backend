import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import { fileUpload } from '../utils/fileUpload.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from "jsonwebtoken"
import { fileRemove } from '../utils/fileRemove.js'


const generate_Access_n_RefreshToken = async (userId, currentRefreshToken = "") => {
    try {
        // Find the user by id
        let user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Generate access token
        const accessToken = user.generateAccessToken();

        let refreshToken;
        if (!currentRefreshToken) { // Generate RefreshToken only if there's no ref.Token or expired
            refreshToken = user.generateRefreshToken();
            // Update the refreshToken & save in DB
            user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false });
        } else {
            refreshToken = currentRefreshToken;
        }

        // Return the tokens
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(506, "Refresh and Access token Generation failed!");
    }
};


const registerUser = asyncHandler( async(req,res,next)=>{
    // console.log(req.body);

    // STEPS:
       // get user details from frontend/Postman
       // validation - not empty
       // check if user already exists: username, email
       // check for images, check for avatar
       // upload them to cloudinary, avatar
       // create user object - create entry in db
       // check for user creation
       // remove password and refresh token field from response
       // return response

try {
    
    // Step 1: get user details from frontend/Postman
        const {fullName, username, email, contact, password } = req.body // avatar & coverImage cloudinary theke
        // console.log(`fullName: ${fullName}, username: ${username}`);
    
    // Step 2: validation - not empty , valid email
        if (fullName?.trim()==='' || username?.trim()==='' || contact?.trim()==='' || email?.trim()==='' || password?.trim()===''){
            throw new ApiError(401,'All Fields are Mandatory');
        }
        if(!email.includes('@')){
            throw new ApiError(402,'Invalid Email Address');
        }
    
    // Step 3: check if user already exists: by username or email
        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        })
    
        if (existedUser) {
            throw new ApiError(403, "User Already Exists")
        }
    
    // Step 4: check if images uploaded to local path by multer, check for avatar
        
        const avatarLocalPath = req.files?.avatar?.[0]?.path
        // console.log(avatarLocalPath);
        const coverImageLocalPath = req.files?.coverImage?.[0]?.path
        // console.log(coverImageLocalPath);
    
        if(!avatarLocalPath){
            throw new ApiError(404, "Avatar is Required!")
        }
    
    // Step 5: upload them to cloudinary, check for avatar
    
        const avatar = await fileUpload(avatarLocalPath);
        console.log('avatar link:',avatar);
        let coverImage="";
        if(coverImageLocalPath){
             coverImage = await fileUpload(coverImageLocalPath);
             console.log('coverImage link:',coverImage);
        } 
    
        if(!avatar){
            throw new ApiError(404, "Avatar is Required!");
        }
    
    
    // Step 6: create user object - create entry in db, check entry holo kina else Server Error
    console.log('\nNow Creating User object...');
        const user1 = await User.create({
            fullName,
            email,
            password,
            avatar,
            contact: parseInt(contact.split('-').join('')),
            username:username.toLowerCase(),
            coverImage:coverImage || "",
        })
    console.log('User Created!');
    
    // Step 7 & 8: check for user creation , else Error.  Remove password and refresh token field from response
    console.log('\nChecking if user Properly Created!');
        const userCreated = await User.findById(user1._id).select("-password -refreshToken")
        // console.log(`User:${userCreated}`);
    
        if(!userCreated){
            throw new ApiError(506,"User Can't be Created. Server Error!")
        }
    
    // Step 9: return response
        console.log("User Created Successfully! All Done!");
        return res.status(200).json(
            new ApiResponse(200, "User Created Successfully!", userCreated)
        )
} catch (error) {
    throw new ApiError(507, error.message || "User Can't be Created. Server Error!")
}
})

const loginUser = asyncHandler( async(req,res)=>{
    // STEPS:
        // {username,email,password} <-- req.body
        // check if email or username and password is provided
        // check if email/username already exists, if not route to '/registerUser'
        // match the email/username with given password
        // if match found,
                //accessToken & refreshToken generate,
                // send through cookies
                // then login
        // else "Incorrect Credentials!"

    try {
        // 1.
        const {username,email,password} = req.body;
    
        // 2.
        if(!username && !email){
            throw new ApiError(405,"Username/Email is Required!");
        }
        if(!password){
            throw new ApiError(405,"Password is Required!");
        }
    
        // 3.
        const existedUser = await User.findOne({
            $or:[{email},{username}]
        })
    
    
        if(!existedUser){
            throw new ApiError(406,"User not found. Register First!");
            // console.log("");
            // registerUser();
        }
    
        // 4.
        console.log("Checking Password...");
        const correctPassword = await existedUser.isCorrectPassword(password);
        if(!correctPassword){
            throw new ApiError(407,"Invalid Password!");
        }
        
        // 5.
        const userId = existedUser._id;
        console.log("\nGenerating Tokens...");
        const {accessToken,refreshToken} = await generate_Access_n_RefreshToken(userId);
        console.log("Tokens Generated!");
    
        const loggedInUser = await User.findById(userId).select("-password -refreshToken");
    
        console.log("User logged In Successfully!🙌");
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, "User logged In Successfully", {user: loggedInUser, accessToken, refreshToken})
        )
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid Request")
    }
    
})

const logoutUser = asyncHandler( async(req,res,next)=>{
    // STEPS:
        //check if user logged in by Access Token   (Middleware -> auth.js)
        // retrieve _id from Token                  (Middleware -> auth.js)
        // get user from _id                        (Middleware -> auth.js)
        // remove Refresh Token value from DB & clear cookie of Access & Refresh Token 


    // console.log(`${req.user}\n`);
    // console.log(`${JSON.stringify(req.cookies, null, 2)}\n`);

    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: { refreshToken: 1 }
            },
            { new: true }
        );
        
        // For DEBUGGING:
        // mongoose.set('debug', true);
        //  await User.findByIdAndUpdate(
        //     req.user._id,
        //     { $unset: { refreshToken: 1 } },
        //     { new: true }
        // );
    
        
        console.log("User logged Out Successfully!");
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, "User logged Out Successfully", {})
        )
    } catch (error) {
        throw new ApiError(507, error.message || "Session Expired!")
    }

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const fetchedRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!fetchedRefreshToken) {
            throw new ApiError(410, "Unauthorized Request");
        }

        const payload = jwt.verify(fetchedRefreshToken, process.env.REFRESH_TOKEN_PRIVATE_KEY);
        if (!payload) {
            throw new ApiError(411, "Invalid Refresh Token Payload");
        }

        const user = await User.findById(payload?._id).select("-password");
        if (!user) {
            throw new ApiError(411, "Invalid Refresh Token!");
        }

        if (fetchedRefreshToken !== user.refreshToken) {
            throw new ApiError(412, "Refresh Token Expired!");
        }

        const { accessToken, refreshToken } = await generate_Access_n_RefreshToken(user?._id, user?.refreshToken);

        console.log("Access Token Refreshed Successfully!");

        const options = {
            httpOnly: true,
            secure: true
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, "Access Token Refreshed Successfully!", { accessToken, refreshToken })
            );
    } catch (error) {
        throw new ApiError(413, error.message || "Invalid refresh token");
    }
});

const updatePassword = asyncHandler( async (req, res, next)=>{
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if(!oldPassword || !newPassword || !confirmPassword){
            throw new ApiError(414, "All Fields are Mandatory!")
        }

        if(oldPassword === newPassword){
            throw new ApiError(414, "New & Old Password can't be same!")
        }
        if(newPassword !== confirmPassword){
            throw new ApiError(415, "Confirm Password doesn't match New Password!")
        }
    
        let user = await User.findById(req.user?._id).select("-refreshToken");  // req.user <- auth middleware
    
        console.log("Checking Password...");
        const isCorrectPassword = await user.isCorrectPassword(oldPassword);
        if(!isCorrectPassword){
            throw new ApiError(416, "Invalid Password!")
        }
    
        console.log("Saving Password...");
        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        console.log("Password Changed Successfully!");
    
        return res
               .status(200)
               .json(
                   new ApiResponse(200, "Password Updated Successfully", {})
               )
    } catch (error) {
        throw new ApiError(417, error.message || "Invalid Request!")
    }
})

const getCurrentUser = asyncHandler( async (req, res, next)=>{
    console.log("User Data Fetched Successfully!");
    return res.status(200)
              .json(
                new ApiResponse(200, "User Data Fetched Successfully!", req.user)
              )
})

const updateUserProfile = asyncHandler( async (req, res, next)=>{
    try {
        const { username, fullName, email } = req.body;
    
        if(!username && !fullName && !email){
            throw new ApiError(418, "Atleast Fill One Field")
        }
    
        let updateFields = {}  
        // only add the fields given by User
        if(username) {updateFields.username = username};
        if(fullName) {updateFields.fullName = fullName};
        if(email) {updateFields.email = email};

        for (const key in updateFields) {
                if (updateFields[key] === req.user[key]){
                    throw new ApiError(418, `${key} can't be same as previous!`)
                }
            }
    
        console.log("Fields to be Updated:", updateFields);
    
        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:updateFields  // selectively update fields given by User -> $set: {keys}
            },
            { new: true }           // returns updated user
        ).select("-password -refreshToken")
    
        if(!user) throw new ApiError(419, "User not Found")
    
        console.log("User Details Updated Successfully!");
    
        return res.status(200)
                  .json(
                     new ApiResponse(200, "User Details Updated Successfully!",  user )
                    )
    } catch (error) {
        throw new ApiError(420, error.message || "Invalid Request!")
    }
})

const updateUserAvatar = asyncHandler( async (req, res, next)=>{
    const avatarLocalPath = req.file?.path; // as single file so req.file not.files...


    if(!avatarLocalPath){
        throw new ApiError(421, "Avatar File is Missing!");
    }

    console.log("Uploading on Cloudinary...");
    const avatar = await fileUpload(avatarLocalPath);
    if(!avatar){
        throw new ApiError(422, "File can't be Uploaded!");
    }

    console.log("Saving in DB...");
    const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set:{ avatar:avatar }
            },
            { new:true }
    ).select("-password -refreshToken")

    console.log("Avatar Updated Successfully!");

    const previousFileUrl = req.user?.avatar;
    
    if(previousFileUrl){
        console.log("Deleting Previously Uploaded Avatar...");
        fileRemove(previousFileUrl);
    }

    return res.status(200)
              .json(
                 new ApiResponse(200, "Avatar Updated Successfully!", user)
                )
    
})

const updateUserCoverImage = asyncHandler( async (req, res, next)=>{
    const coverImageLocalPath = req.file?.path; // as single file so req.file not.files...

    const previousFileUrl = req.user?.coverImage;
    if(!coverImageLocalPath){
        throw new ApiError(421, "Cover Image File is Missing!");
    }
    console.log("Uploading on Cloudinary...");
    const coverImage = await fileUpload(coverImageLocalPath);
    if(!coverImage){
        throw new ApiError(422, "File can't be Uploaded!");
    }

    console.log("Saving in DB...");
    const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set:{ coverImage:coverImage }
            },
            { new:true }
            ).select("-password -refreshToken")

    console.log("Cover Image Updated Successfully!");

    if(previousFileUrl){
        console.log("Deleting Previously Uploaded Cover Image...");
        fileRemove(previousFileUrl)
    }
    
    return res.status(200)
              .json(
                 new ApiResponse(200, "Cover Image Updated Successfully!", user)
                )
})

const deleteUser = asyncHandler( async(req,res)=>{
    try {
        const userId = req.user?._id
        if(!userId){
            throw new ApiError(423,"Session Expired!")
        }

        console.log("Deleting Account...");
        
        await User.findByIdAndDelete(userId);
        console.log("User Account Deleted Successfully!");
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res.status(200)
                  .clearCookie("accessToken", options)
                  .clearCookie("refreshToken", options)
                  .json(
                     new ApiResponse(200, "User Account Deleted Successfully!",{})
                    )
    } catch (error) {
        throw new ApiError(424, error.message || "User not Found")
    }
})

const getUserChannelProfile = asyncHandler( async(req,res)=>{

    const {username} = req.params;
    if(!username.trim()){
        throw new ApiError(424,"Invalid Request")
    }

    const channel = await User.aggregate([     //i.e. User model er sathe add hobe
        {
            $match:{
                username: username.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",                 //plural & lowercase of "Subscription" model ,... je model ta add hobe
                localField: "_id",                     // User model er je field e add hobe
                foreignField: "channel",               // Subscription model er je field e add hobe
                as: "subscribers"                      // User model e je name add hobe
            }
        },
        {
            $lookup:{
                from: "subscriptions",                 //plural & lowercase of "Subscription" model ,... je model ta add hobe
                localField: "_id",                     // User model er je field e add hobe
                foreignField: "subscriber",               // Subscription model er je field e add hobe
                as: "subscribedTo"                      // User model e je name add hobe
            }
        },  
        {
          $addFields:{
            subscribersCount:{
                $size: "$subscribers"
            },
            channelSUbscribedToCount:{
                $size: "$subscribedTo"
            },
            isSubscribed:{
               $cond:{
                 if:{ $in: [req.user?._id, "$subscribers"]},
                 then: true,
                 else: false
               }
            }
            
          }  
        },
        {
            $project:{
                fullName: 1,
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                channelSUbscribedToCount: 1,
                isSubscribed: 1,
            }
        },
    ])

    console.log(channel);

    if(channel?.length<=0){
        throw new ApiError(425,"Channel not found!")
    }
    
    return res.status(200)
            .json(
                new ApiResponse(200, channel[0], "User Channel Fetched Successfully!")
            )

})


/*
 * from: The target collection.
 * localField: The local join field.
 * foreignField: The target join field.
 * as: The name for the results.
 * */

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updatePassword,
    getCurrentUser,
    updateUserProfile,
    updateUserAvatar,
    updateUserCoverImage,
    deleteUser,
    getUserChannelProfile,
}
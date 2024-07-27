import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import { fileUpload } from '../utils/fileUpload.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import  mongoose  from "mongoose";


const generate_Access_n_RefreshToken = async (userId)=>{
        try {
            //find the user by id
            let user = await User.findById(userId);
            // generate tokens for the user
            const accessToken  = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();
            // update the refreshToken & save in DB
            user.refreshToken = refreshToken;
            await user.save({validateBeforeSave:false});
            // return the tokens...
            return { accessToken,refreshToken };
        } catch (error) {
            throw new ApiError(506, "Referesh and Access token Generation failed!");
        }
     
}


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


// Step 1: get user details from frontend/Postman
    const {fullName, username, email, password } = req.body // avatar & coverImage cloudinary theke
    // console.log(`fullName: ${fullName}, username: ${username}`);

// Step 2: validation - not empty , valid email
    if (fullName?.trim()==='' || username?.trim()==='' || email?.trim()==='' || password?.trim()===''){
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
console.log('\nNow Creating User object!');
    const user1 = await User.create({
        fullName,
        email,
        password,
        avatar,
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
        new ApiResponse(200,userCreated,"User Created Successfully!")
    )
})

const loginUser = asyncHandler( async(req,res,next)=>{
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

    console.log("User logged In Successfully");

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
    
})

const logoutUser = asyncHandler( async(req,res,next)=>{
    // STEPS:
        //check if user logged in by Access Token   (Middleware -> auth.js)
        // retrieve _id from Token                  (Middleware -> auth.js)
        // get user from _id                        (Middleware -> auth.js)
        // remove Refresh Token value from DB & clear cookie of Access & Refresh Token 


    // console.log(`${req.user}\n`);
    // console.log(`${JSON.stringify(req.cookies, null, 2)}\n`);

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

})


export {registerUser,loginUser, logoutUser}
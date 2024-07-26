import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import { fileUpload } from '../utils/fileUpload.js'
import { ApiResponse } from '../utils/ApiResponse.js'

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

const loginUser = asyncHandler(async(req,res,next)=>{
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
    const existedUser = User.findOne({
        $or:[{email},{username}]
    })

    if(!existedUser){
        throw new ApiError(406,"Register First!");
        // console.log("");
        // registerUser();
    }

    // 4.
    const correctPassword = await existedUser.isCorrectPassword(password);
    if(!correctPassword){
        throw new ApiError(407,"Incorrect Password!");
    }
    else{
        
    }

})

export {registerUser,loginUser}
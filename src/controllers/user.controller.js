import { asyncHandler } from "../utils/asyncHandler.js"; //dont forget to add .js,it could bring more error
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOnClounary } from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js"

import jwt from 'jsonwebtoken'


//generate access and refresh Token

const generateAccessAndRefreshToken = async (userId) => {
   try {
      const user = await User.findById(userId);
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      //inject refreshToken to user
      user.refreshToken = refreshToken

      //after adding refreshToken I need to save it to mongoDb, so
      await user.save({ ValidateBeforeSave: false })

      return { accessToken, refreshToken }

   } catch (error) {
      throw new ApiError(500, "Something went wrong while generating tokens")
   }
}


const registerUser = asyncHandler(async (req, res, next) => {
   //get user data from frontend
   //validation - if empty or missing any field
   //check if user already exist- using id or one of field
   //check for images, check for avatar
   //upload them on cloudinary
   //check if multer successfully uploaded my file to my server
   //check if cloudinary successfully store them in cloud
   //create user object - create entry in db
   //remove password and refresh token from response(I dont want to give user encrypted password as a response)
   //check if user created
   //return response
   const { fullName, email, password, username } = req.body;




   //Check for all fields validation
   // if(fullName===""){
   //    throw new ApiError(400,"fullname field not found")
   // }

   if ([fullName, username, email, password].some(field => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required")
   }

   //If the user already exist or not
   const existedUser = await User.findOne({
      $or: [{ username }, { email }]
   })
   if (existedUser) {
      throw new ApiError(409, "user already exist")
   }
   console.log(req.files)

   //Check images validality
   const avatarLocalPath = req.files?.avatar[0]?.path;
   const coverImageLocalPath = req.files?.coverImage[0]?.path;

   console.log("avatarFilepath :", avatarLocalPath);


   if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required")
   };
   //before uploading on cloudinary check the validality if files and file path is present or not

   const avatar = await uploadOnClounary(avatarLocalPath) //because it takes time
   const coverImage = await uploadOnClounary(coverImageLocalPath)

   console.log(avatar);


   if (!avatar) {
      throw new ApiError(400, "Avatar file is not on cloudinary")
   }

   const user = await User.create({
      fullName,
      email,
      password,
      username: username.toLowerCase(),
      avatar: avatar.url,
      coverImage: coverImage?.url || "",

   })
   const createduser = await User.findById(user._id).select("-password -refreshToken")
   //select = by default select all the fields, but if I do -(minus) password then that field will be removed and give it to user by response
   if (!createduser) {
      throw new ApiError(500, "Something went wrong while registering the user");
   }

   return res.status(201).json(
      new ApiResponse(201,
         createduser, "User has been created"
      )
   )

})

const loginUser = asyncHandler(async (req, res, next) => {
   //get the data from frontend(username or email and password)
   //check if any field is empty 
   //check if any credential is invalid -> redirect to register / signup
   //password check
   //if everything is valid then send access and refresh token(by which user can access certain API resources)
   //send cookie to the browser
   console.log(req.body);

   const { email, username, password } = req.body
   console.log(username)
   console.log(password);

   if (!(username || email)) {
      throw new ApiError(400, "username or email is required")
   }

   const user = await User.findOne({
      $or: [{ email }, { username }]
   })
   if (!user) {
      throw new ApiError(400, "username or email is not valid")
   }

   //check the password using userSchema.method that is available to this user coming from frontend

   const passwordCheck = await user.comparePassword(password);//we get true or false value


   if (!passwordCheck) {
      throw new Error(401, "password is incorrect")
   }

   //getting the access of accessToken and refreshToken
   const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

   //ignore unwanted fields, not giving the user as a token
   const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

   //settings for cookies
   const options = {
      httpOnly: true,//only for server modifiable not for frontend
      secure: true
   }

   return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200,
         {
            user: [loggedInUser, accessToken, refreshToken]
         }
         , "User logged in successfully"))

})
const logoutUser = asyncHandler(async (req, res, next) => {

   //To logOut user, I need user details, but cant find, because then again I have to force user to fill a form where he gives username/email and password- that is not possible
   //So we use a middleware where before I perform this logout handler I already get user
   //middleware can modify any req and res object
   //so req.user=user that I could get from the cookie by parsing it
   const user = req.user;

   //to loggedout the user, undefined the refreshToken value in user
   //and clear the cookie
   await User.findByIdAndUpdate(user._id, {
      $set: {
         refreshToken: undefined
      }
   })

   const options = {
      httpOnly: true,
      secure: true
   }

   return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "Logged out successfully"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
   const incomingToken = req.cookies?.refreshToken || req.body.refreshToken;
   if (!incomingToken) {
      throw new ApiError(403, "Unauthorized user")
   }

   try {
      const decodedToken = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);

      const user = await User.findById(decodedToken._id).select("-password -refreshToken")

      if (!user) {
         throw new ApiError(401, "Invalid refresh Token")
      }

      if (incomingToken !== user?.refreshToken) {
         throw new ApiError(401, "Refresh Token is expired or used")
      }

      const options = {
         httpOnly: true,
         secure: true
      };

      const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

      return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200, {
         user: user
      },
         "Access Token generated"
      ))

   } catch (error) {
      console.log("Error : Fail To Generate Access Token");
      throw new ApiError(401, error?.message || "Invalid refresh Token")

   }
})

const updateUserPassword = asyncHandler(async (req, res) => {
   const { oldPassword, newPassword, confirmPassword } = req.body;
   if (!(newPassword === confirmPassword)) {
      throw new ApiError(401, "Password did not match")
   }
   //I will add the auth middleware to this controller so I can get req.user(because I already verify it in jwt by extracting cookies)
   const user = await User.findById(req.user?._id)

   const passwordComparison = await user.comparePassword(oldPassword);

   //no password matching
   if (!passwordComparison) {
      throw new ApiError(400, "password don't match")
   }

   //password matched, so update the password with new one
   user.password = newPassword
   //because I set new value to database, It should save it 

   //whenever someone calls .save() on a User document, run that function first. If I dont do .save() , userSchema.pre("save") will never runs that function that triggers hashing password.
   await user.save({ ValidateBeforeSave: false })
   //.save() event hits, calls the function that do hashing the password by bcrypt

   return res.status(200).json(new ApiResponse(
      200,
      changedPasswordUser,
      "Password updated successfully"
   ))
})


const getCurrentUser = asyncHandler(async (req, res) => {
   const user = req.user
   if (!user) {
      throw new ApiError(400, "user not found")
   }
   return res.status(200).json(new ApiResponse(200, user, "get user successfully"))
})


const updateAccountDetails = asyncHandler(async (req, res) => {
   const { fullName, email } = req.body;

   if (!(fullName || email)) {
      throw new ApiError(400, "Please enter fullname and email")
   }

   const user = await User.findByIdAndUpdate(req.user?._id,
      {
         $set: {
            email: email,
            fullName: fullName
         }
      },
      { new: true }
   ).select("-password")
   if (!user) {
      throw new ApiError(500, "Could not update the user")
   };

   return res.status(200).json(
      new ApiResponse(200,
         user,
         "User updated successfully"
      )
   )

});

const updateUserAvatar = asyncHandler(async (req, res) => {
   const avatarpath = req.file?.path;
   if (!avatarpath) {
      throw new ApiError(400, "avatar file missing")
   }

   const avatar = await uploadOnClounary(avatarpath);

   if (!avatar.url) {
      throw new ApiError(500, "Avatar file cant upload properly")
   };

   const user = await User.findByIdAndUpdate(req.user?._id,
      {
         $set: {
            avatar: avatar.url //just take a string
         }
      },
      { new: true }
   ).select("-password");

   return res.status(200).json(
      new ApiResponse(200, user, "avatar updated successfully")
   )


});

const updateUserCoverImage = asyncHandler(async (req, res) => {
   const coverImageLocalPath = req.file?.path;
   if (!coverImageLocalPath) {
      throw new ApiError(400, "coverImage file missing")
   }

   const coverImage = await uploadOnClounary(coverImageLocalPath);

   if (!coverImage.url) {
      throw new ApiError(500, "coverImage file cant upload properly")
   };

   const user = await User.findByIdAndUpdate(req.user?._id,
      {
         $set: {
            coverImage: coverImage.url //just take a string
         }
      },
      { new: true }
   ).select("-password");

   return res.status(200).json(
      new ApiResponse(200, user, "coverImage updated successfully")
   )


})

export {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken,
   updateUserPassword,
   getCurrentUser,
   updateAccountDetails,
   updateUserAvatar,
   updateUserCoverImage
}

import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'

//It will verify if it has user or not

import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

//get verify via cookie=access and refresh token
//by jwt.verify(token,secret_key)

export const verifyJwt = asyncHandler(async (req, res, next) => {
    //get the access and refresh token
  try {
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
  
      if (!token) {
          throw new ApiError(401, "Unauthorized request");
      }
  
      //verify this token by jwt.verify
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
      if (!user) {
          throw new ApiError(401, "Invalid access token")
      }
      req.user = user; //because To logout I need a user to logout that user
      next()
  
  } catch (error) {
    throw new ApiError(401,error?.message || "nvalid access token")
  }
})
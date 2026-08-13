import { Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'


const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'password is required']
    },
    avatar: {
        type: String, //cloudinary url
        required: true
    },
    coverImage: {
        type: String, //cloudinary url

    },


    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: 'Video'
    }],//I will store multiple videos ref in one array, object because we hold multiple values
    refreshToken: {
        type: String
    },

}, { timestamps: true });

//hooks in Schemas
userSchema.pre('save', async function (next) {
    const salt = 10

    if (!this.isModified("password")) return 
    //if there is no modification in this(userSchema) password field then return the next middleware function

    this.password = await bcrypt.hash(this.password, salt)
    
})

userSchema.methods.comparePassword = async function (password) {
   return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    const payload = {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    };

    return jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY})
}
userSchema.methods.generateRefreshToken = function () {
    const payload = {
        _id: this._id,
      
    };

    return jwt.sign(payload,process.env.REFRESH_TOKEN_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXPIRY})
}

const User = model('User', userSchema);
export {User}
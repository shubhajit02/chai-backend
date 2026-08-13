import { Router } from 'express'
import { loginUser, logoutUser, refreshAccessToken, registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJwt } from '../middlewares/auth.middleware.js'
//Router is a property of express,comes through destructuring

const router = Router();

router.route('/register').post(upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
]), registerUser)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJwt, logoutUser)
//verifyJwt middleware

router.route('/refresh-token').post(refreshAccessToken)

export default router


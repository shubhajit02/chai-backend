import {Router} from 'express'
import { registerUser } from '../controllers/user.controller.js';

//Router is a property of express,comes through destructuring

const router=Router();

router.post('/register',registerUser)

export default router


import {Router} from 'express'
import { loginUserController, logoutController, registerUserController, userAvatarController, verifyEmailController } from '../controllers/user.controller.js'
import auth from '../middleware/auth.js'
import upload from '../middleware/multer.js'

const userRouter = Router () 
userRouter.post('/register',registerUserController)
userRouter.post('/verifyEmail',verifyEmailController)
userRouter.post('/login',loginUserController)
userRouter.get('/logout',auth,logoutController)
userRouter.put('/user-avatar',auth, upload.array('avatar'), userAvatarController)




export default userRouter
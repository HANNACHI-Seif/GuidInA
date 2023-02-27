import express from 'express'
import { loginUser, logoutUser, refreshAccessToken, register_user, userEditPassword } from '../controllers/authController'
import { authMiddleware, refreshMiddleware } from '../utilities/token'
let router = express.Router()

router.post('/register', register_user)

router.post('/login', loginUser)

router.post('/logout', authMiddleware, logoutUser)

router.post('/refresh', refreshMiddleware, refreshAccessToken)

router.patch('/password', authMiddleware, userEditPassword)


export default router
import express from 'express'
import { confirmEmailGet, forgotPassword, loginUser, logoutUser, refreshAccessToken, register_user, resetPasswordGet, resetPasswordPost } from '../controllers/authController'
import { authMiddleware, refreshMiddleware } from '../utilities/token'
let router = express.Router()

router.post('/register', register_user)

router.post('/login', loginUser)

router.post('/logout', authMiddleware, logoutUser)

router.post('/refresh', refreshMiddleware, refreshAccessToken)

router.patch('/password', authMiddleware, userEditPassword)

router.get('/confirmation/:token', confirmEmailGet)

router.post('/forgotPassword', forgotPassword)

router.get('/password-reset/:userId/:token', resetPasswordGet)

router.post('/password-reset/:userId/:token', resetPasswordPost)


export default router
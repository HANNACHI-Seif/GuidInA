import express from 'express'
import { spUserEditProfile, touristEditUsername, userEditPassword, userUploadpfp } from '../controllers/userController'
import { authMiddleware } from '../utilities/token'
import handleSingleImageUpload from 'src/utilities/singleImageUploadHandler'

let router = express.Router()

router.patch('/password', authMiddleware, userEditPassword)

router.patch('/username', authMiddleware, touristEditUsername)

router.patch('/profile', authMiddleware, spUserEditProfile)

router.patch('/pfp', authMiddleware, handleSingleImageUpload, userUploadpfp)

export default router
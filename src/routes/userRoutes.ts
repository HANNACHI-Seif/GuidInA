import express from 'express'
import { fetchSPUSerProfile, fetchUserRoles, spUserEditProfile, touristEditUsername, userEditPassword, userUploadpfp } from '../controllers/userController'
import { authMiddleware } from '../utilities/token'
import handleSingleImageUpload from '../utilities/singleImageUploadHandler'
import { adminCheck } from '../middleware/admin.middleware'

let router = express.Router()

router.patch('/password', authMiddleware, userEditPassword)

router.patch('/username', authMiddleware, touristEditUsername)

router.patch('/profile', authMiddleware, spUserEditProfile)

router.patch('/pfp', authMiddleware, handleSingleImageUpload, userUploadpfp)

router.get('/profile', authMiddleware, fetchSPUSerProfile)

router.get('/roles', authMiddleware, adminCheck, fetchUserRoles)

export default router
import express from 'express'
import { createApplicationForm, adminAcceptApplication, adminDeclineApplication, fetchAllAppplications } from '../controllers/roleApplicationController'
import { authMiddleware } from '../utilities/token'
import { adminCheck } from '../middleware/admin.middleware'
import handleFileUpload from '../utilities/fileUploadHandler'


let router = express.Router()

router.post('/apply', authMiddleware, handleFileUpload, createApplicationForm)

router.post('/accept/:id', authMiddleware, adminCheck, adminAcceptApplication)

router.delete('/refuse/:id', authMiddleware, adminCheck, adminDeclineApplication)

router.get('/all_applications', authMiddleware, adminCheck, fetchAllAppplications)

export default router
import express from 'express'
import { addDestImage, addDestination, deleteDest, deleteDestImage, editDest } from '../controllers/destController'
import { authMiddleware } from '../utilities/token'
import handleMultipleImageUpload from '../utilities/multipleImageUploadHandler'
import { adminCheck } from '../middleware/admin.middleware'


let router = express.Router()



router.post('/addDest', authMiddleware, adminCheck, addDestination)

router.post('/:id/addImage', authMiddleware, adminCheck, handleMultipleImageUpload, addDestImage)

router.delete('/:destId/image/:imageId', authMiddleware, adminCheck, deleteDestImage)

router.delete('/:id', authMiddleware, adminCheck, deleteDest)

router.patch('/:id/edit', authMiddleware, adminCheck, editDest)



export default router
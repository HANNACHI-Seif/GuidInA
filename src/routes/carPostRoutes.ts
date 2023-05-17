import express from 'express'
import { changeCarState, createCarPost, deleteCarPost, editCarPost } from '../controllers/carPostController'
import { authMiddleware } from '../utilities/token'
import handleImageUpload from '../utilities/imageUploadHandler'


let router = express.Router()

router.post('/add_car', authMiddleware, handleImageUpload, createCarPost)

router.delete('/delete_car/:id', authMiddleware, deleteCarPost)

router.patch('/edit_car/:id', authMiddleware, editCarPost)

router.post('/change_state/:id', authMiddleware, changeCarState)

export default router
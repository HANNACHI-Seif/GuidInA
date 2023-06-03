import express from 'express'
import { changeCarState, createCarPost, deleteCarPost, editCarPost, fetchCarPosts } from '../controllers/carPostController'
import { authMiddleware } from '../utilities/token'
import handleMultipleImageUpload from '../utilities/multipleImageUploadHandler'


let router = express.Router()

router.post('/add_car', authMiddleware, handleMultipleImageUpload, createCarPost)

router.delete('/delete_car/:id', authMiddleware, deleteCarPost)

router.patch('/edit_car/:id', authMiddleware, editCarPost)

router.post('/change_state/:id', authMiddleware, changeCarState)

router.get('/fetch', authMiddleware, fetchCarPosts)

export default router
import express from 'express'
import { createCarPost, deleteCarPost } from '../controllers/carPostController'
import { authMiddleware } from '../utilities/token'


let router = express.Router()

router.post('/add_car', authMiddleware, createCarPost)

router.delete('/delete_car/:id', authMiddleware, deleteCarPost)

export default router
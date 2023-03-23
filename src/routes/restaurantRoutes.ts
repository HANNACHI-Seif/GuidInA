import express from 'express'
import { authMiddleware } from '../utilities/token'
import handleFileUpload from '../utilities/img'
import { adminCheck } from '../middleware/admin.middleware'
import { addRestaurant, addRestaurantImage, deleteRestaurantImage, deleteRestaurant, editRestaurant } from '../controllers/restaurantController'


let router = express.Router()



router.post('/addRestaurant', authMiddleware, adminCheck, addRestaurant)

router.post('/:id/addImage', authMiddleware, adminCheck, handleFileUpload, addRestaurantImage)

router.delete('/:restaurantId/image/:imageId', authMiddleware, adminCheck, deleteRestaurantImage)

router.delete('/:id', authMiddleware, adminCheck, deleteRestaurant)

router.patch('/:id/edit', authMiddleware, adminCheck, editRestaurant)



export default router
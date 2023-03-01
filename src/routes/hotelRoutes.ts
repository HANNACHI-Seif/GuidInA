import express from 'express'
import { authMiddleware } from '../utilities/token'
import upload from '../utilities/img'
import { adminCheck } from '../middleware/admin.middleware'
import { addHotel, addHotelImage, deleteHotel, deleteHotelImage, editHotel } from '../controllers/hotelController'


let router = express.Router()



router.post('/addHotel', authMiddleware, adminCheck, addHotel)

router.post('/:id/addImage', authMiddleware, adminCheck, upload.single("image"), addHotelImage)

router.delete('/:hotelId/image/:imageId', authMiddleware, adminCheck, deleteHotelImage)

router.delete('/:id', authMiddleware, adminCheck, deleteHotel)

router.patch('/:id/edit', authMiddleware, adminCheck, editHotel)



export default router
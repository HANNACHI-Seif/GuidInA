import express from 'express'
import { authMiddleware } from '../utilities/token'
import { adminCheck } from '../middleware/admin.middleware'
import { addHotel, addHotelImage, deleteHotel, deleteHotelImage, editHotel } from '../controllers/hotelController'
import handleMultipleImageUpload from '../utilities/multipleImageUploadHandler'


let router = express.Router()



router.post('/addHotel', authMiddleware, adminCheck, addHotel)

router.post('/:id/addImage', authMiddleware, adminCheck, handleMultipleImageUpload, addHotelImage)

router.delete('/:hotelId/image/:imageId', authMiddleware, adminCheck, deleteHotelImage)

router.delete('/:id', authMiddleware, adminCheck, deleteHotel)

router.patch('/:id/edit', authMiddleware, adminCheck, editHotel)



export default router
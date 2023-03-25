import express from 'express'
import { authMiddleware } from '../utilities/token'
import { addHotelReview, deleteHotelReview, editHotelReview, fetchHotelReviews } from '../controllers/hotelReviewController'


let router = express.Router()


router.post('/:id/add', authMiddleware, addHotelReview)

router.get('/:id/all', authMiddleware, fetchHotelReviews)

router.delete('/:id/delete', authMiddleware, deleteHotelReview)

router.patch('/:id/edit', authMiddleware, editHotelReview)

export default router
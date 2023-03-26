import express from 'express'
import { authMiddleware } from '../utilities/token'
import { addRestReview, deleteRestReview, editRestReview, fetchRestReviews } from '../controllers/restReviewController'


let router = express.Router()


router.post('/:id/add', authMiddleware, addRestReview)

router.get('/:id/all', authMiddleware, fetchRestReviews)

router.delete('/:id/delete', authMiddleware, deleteRestReview)

router.patch('/:id/edit', authMiddleware, editRestReview)

export default router
import express from 'express'
import { authMiddleware } from '../utilities/token'
import { addDestinationReview, deleteDestinationReview, editDestReview, fetchDestReviews } from '../controllers/destReviewController'


let router = express.Router()


router.post('/:id/add', authMiddleware, addDestinationReview)

router.get('/:id/all', authMiddleware, fetchDestReviews)

router.delete('/:id/delete', authMiddleware, deleteDestinationReview)

router.patch('/:id/edit', authMiddleware, editDestReview)

export default router
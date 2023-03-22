import express from 'express'
import { addUserReview, deleteUserReview, editUserReview, fetchUserRevivews } from '../controllers/userReviewController'
import { authMiddleware } from '../utilities/token'


let router = express.Router()


router.post('/:id/add', authMiddleware, addUserReview)

router.get('/:id/all', authMiddleware, fetchUserRevivews)

router.delete('/:id/delete', authMiddleware, deleteUserReview)

router.patch('/:id/edit', authMiddleware, editUserReview)

export default router
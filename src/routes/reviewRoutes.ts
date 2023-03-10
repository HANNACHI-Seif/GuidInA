import express from 'express'
import { addReview, deleteReview, fetchUserRevivews } from '../controllers/reviewController'
import { authMiddleware } from '../utilities/token'
import { adminCheck } from '../middleware/admin.middleware'


let router = express.Router()


router.post('/:id/add', authMiddleware, addReview)

router.get('/:id/all', authMiddleware, fetchUserRevivews)

router.delete('/:id/delete', authMiddleware, deleteReview)

export default router
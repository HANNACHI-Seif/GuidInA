import express from 'express'
import { authMiddleware } from '../utilities/token'
import { adminSearchDestinations, adminSearchForUsers, adminSearchHotels, adminSearchRestaurants, searchDHR } from '../controllers/searchController'
import { adminCheck } from '../middleware/admin.middleware'


const router = express.Router()

router.get('/places/:q', authMiddleware, searchDHR)

router.get('/users/:q', authMiddleware, adminCheck, adminSearchForUsers)

router.get('/destinations/:q', authMiddleware, adminCheck, adminSearchDestinations)

router.get('/hotels/:q', authMiddleware, adminCheck, adminSearchHotels)

router.get('/restaurants/:q', authMiddleware, adminCheck, adminSearchRestaurants)


export default router
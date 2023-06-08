import express from 'express'
import { authMiddleware } from '../utilities/token'
import { adminAddUser, adminDeleteUser, adminEditUser, adminFetchAllUsers } from '../controllers/adminController'
import { adminCheck } from '../middleware/admin.middleware'
let router = express.Router()

router.post('/addUser', authMiddleware, adminAddUser)

router.delete('/deleteUser/:id', authMiddleware, adminDeleteUser)

router.patch('/editUser/:id', authMiddleware, adminEditUser)

router.get('/fetch', authMiddleware, adminCheck, adminFetchAllUsers)


export default router
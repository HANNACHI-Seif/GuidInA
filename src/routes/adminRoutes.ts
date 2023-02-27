import express from 'express'
import { authMiddleware } from '../utilities/token'
import { adminAddUser, adminDeleteUser, adminEditUser } from '../controllers/adminController'
let router = express.Router()

router.post('/addUser', authMiddleware, adminAddUser)

router.delete('/deleteUser/:id', authMiddleware, adminDeleteUser)

router.patch('/editUser/:id', authMiddleware, adminEditUser)


export default router
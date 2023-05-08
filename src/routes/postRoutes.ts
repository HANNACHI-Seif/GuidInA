import express from 'express'
import { authMiddleware } from '../utilities/token'
import handleImageUpload from "../utilities/img";
import { addPost, commentOnPost, delete_Comment, delete_Post, fetchAllComments, fetchAllLikes, fetchAllPosts, likePost } from '../controllers/postController';


let router = express.Router()

router.post('/share', authMiddleware, handleImageUpload,  addPost)

router.delete('/delete/:id', authMiddleware, delete_Post)

router.get('/fetchAll', authMiddleware, fetchAllPosts)

router.post('/:id/like', authMiddleware, likePost)

router.post('/:id/comment', authMiddleware, commentOnPost)

router.delete('/:postId/comment/:commentId', authMiddleware, delete_Comment)

router.get('/:id/comments', authMiddleware, fetchAllComments)

router.get('/:id/likes', authMiddleware, fetchAllLikes)



export default router



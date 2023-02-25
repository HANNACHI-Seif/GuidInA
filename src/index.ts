import express, { Request, Response } from "express";
import appDataSource from "./ormconfig"
import User from "./entities/user";
import cookieParser from 'cookie-parser';
import jwt from "jsonwebtoken"
import { authMiddleware, createToken, deleteToken, generateToken, refreshMiddleware } from "./utilities/token";
import Post from "./entities/post";
import RefreshToken from "./entities/refreshToken";
import { AdminEditUser, createUser, deleteUser, fetchUser, fetchUserByusrn, saveToDB } from "./middleware/user.middleware";
import {  fetchLike, fetchPost, savePost, saveLike, deleteLike, saveComment, fetchComment, deleteComment } from "./middleware/post.middleware";
import bcrypt from "bcrypt"
import Like from "./entities/like"
import Comment from "./entities/comment";
import upload from "./utilities/img";
import fs from 'fs'
import { generateHash } from "./utilities/hash";
import authRoutes from './routes/authRoutes'
require("dotenv").config();

//routes
(async() => {
    await appDataSource.initialize()
    
    const app = express()

    //midddleware
    app.use(express.json())
    app.use(cookieParser())

    app.listen(process.env.PORT, () => console.log("listening..."))

    //testing routes:
    app.get('/allUsers', async (req: Request, res: Response) => {
        try {
            let userRepo = appDataSource.getRepository(User)
            let users = await userRepo.find({ relations: { likes: true, comments: true, tokens: true, posts: true} })
            res.json({users})
        } catch (err) {
            console.log(err);
            res.json({ msg: "could not fetch users" })
        }
    })

    app.get('/allTokens', async (req: Request, res: Response) => {
        try {
            let tokenRepo = appDataSource.getRepository(RefreshToken)
            let tokens = await tokenRepo.find({ relations: { user: true } })
            res.json({ tokens })
        } catch (error) {
            console.log(error)
            res.json({ msg: "could not fetch tokens" })
        }   
    })

    app.get('/allLikes', async (req: Request, res: Response) => {
        try {
            let likeRepo = appDataSource.getRepository(Like)
            let likes = await likeRepo.find()
            res.json({ likes })
        } catch (error) {
            console.log(error)
            res.json({ msg: "could not fetch likes" })
        }
    })

    app.get('/allComments', async (req: Request, res: Response) => {
        try {
           let commentRepo = appDataSource.getRepository(Comment)
           let comments = await commentRepo.find()
           res.json({ comments })
        } catch (error) {
            console.log(error)
            res.json({ msg: "could not fetch comments" })
        }
    })


    //routes
    app.use('/user', authRoutes)
  

    //user edit password
    app.patch('/passwd', authMiddleware, async (req: Request, res: Response) => {
        let { oldPassword, newPassword, user }: { oldPassword: string, newPassword: string, user: User } = req.body
        try {
            if (await bcrypt.compare(oldPassword, user.password)) {
                //setting a new password
                user.password = await generateHash(newPassword)
                appDataSource.manager.save(user)
                res.json({ msg: "password updated successfuly" })
            } else throw new Error("wrong old password")
        } catch (error) {
            console.log(error)
            res.json({ msg: "could not update password" })
        }
    })

    //add post
   app.post('/addPost', upload.single("image"), authMiddleware, async (req: Request, res: Response) => {
        try {
            let { caption, user } = req.body
            let imageUrl = req.file?.path
            await savePost(caption, imageUrl, user)
            res.json({ msg: "post added successfuly" })
        } catch (error) {
            console.log(error)
            res.json({ msg: "could not add post" })
        }
   })


   //delete post
   app.delete('/post/:id', authMiddleware, async (req: Request, res: Response) => {
        try {
            let user: User = req.body.user
            let postToDelete = await fetchPost(req.params.id, { user: true }) 
            if (!postToDelete) throw new Error("post not found!")
            if ((postToDelete.user.id !== user.id) && !user.isAdmin) throw new Error("Unauthorized")
            //delete
            appDataSource.manager.remove(postToDelete)
            if (fs.existsSync(postToDelete.imageUrl)) {
                fs.unlinkSync(postToDelete.imageUrl);
            }
            res.json({ msg: "post deleted" })
        } catch (error) {
            console.log(error)
            res.json({ msg: "unauthorized" })
        }
   })

   //get all posts
    app.get('/allPosts', authMiddleware, async (req: Request, res: Response) => {
        try {
            let postRepo = appDataSource.getRepository(Post)
            let posts = await postRepo.find({ relations: { likes: true, comments: true, user: true } })
            res.json({ posts })
        } catch (error) {
            console.log(error)
            res.json({ msg: "could not fetch posts" })
        }
    })


    //like post
    app.post('/post/:id/like', authMiddleware, async (req: Request, res: Response) => {
        try {
            let user: User = req.body.user
            let post = await fetchPost(req.params.id)
            if (!post) throw new Error("post not found!")
            //checking if already liked, and dislike if so
            let like = await fetchLike(user.id, post)
            if (!like) {
                //Like
                saveLike(user, post)
                res.json({ msg: "liked" })
            } else {
                //dislike
                deleteLike(like.id)
                res.json({ msg: "disliked" })
            }
        } catch (error) {
            console.log(error)
            res.json({msg: "something went wrong"})
        }
    })

    //all likes of a post
    /*
    app.get('/post/:id/likes', authMiddleware, async (req: Request, res: Response) => {
        try {
            let post = await fetchPost(req.params.id)
        } catch (error) {
            
        }
    }) */
    
    //comment on post
    app.post('/post/:id/comment', authMiddleware, async (req: Request, res: Response) => {
        try {
            let { user, text }: { user: User, text: string } = req.body
            let post = await fetchPost(req.params.id)
            if (!post) throw new Error("something went wrong")
            saveComment(user, post!, text)
            res.json({ msg: "comment added" })
        } catch (error) {
            console.log(error)
            res.json({ msg: "failed" })
        }
    })

    //delete comment
    app.delete('/post/:postId/comments/:commentId', authMiddleware, async (req: Request, res: Response) => {
        try {
            let user: User = req.body.user
            let post = await fetchPost(req.params.postId, { comments: true, user: true })
            let comment = await fetchComment(req.params.commentId)
            if (!post || !comment) throw new Error("something went wrong")
            let commentInPost = post.comments.some((postComments) => postComments?.id == comment!.id)
            if (!commentInPost) throw new Error("unauthorized")
            if (user.isAdmin || user.id == comment.user.id || user.id == post.user.id) {
                deleteComment(comment.id)
                res.json({ msg: "deleted" })
            }
        } catch (error) {
            console.log(error)
            res.json({ msg: "could not delete comment" })
        }
    })

    //admin routes
    //admin add user
    app.post('/admin/addUser', authMiddleware, async (req: Request, res: Response) => {
        try {
            let { user, username, password, email, isAdmin }: { user: User, username: string, password: string, email: string, isAdmin: boolean } = req.body
            if (!user.isAdmin) throw new Error("Unauthorized")
            //add user
            let newUser = await createUser(username, password, email, isAdmin)
            appDataSource.manager.save(newUser)
            res.json({ msg: "user created" })
        } catch (error) {
            console.log(error)
            res.json({ msg: "could not create user" })
        }
    })

    //admin delete user
    app.delete('/admin/deleteUser/:id', authMiddleware, (req: Request, res: Response) => {
        try {
            let { user }: { user: User, userToDeleteId: string } = req.body
            if (!user.isAdmin) throw new Error("Unauthorized")
            deleteUser(req.params.id)
            res.json({ msg: "user deleted successfuly" })
        } catch (error) {
            console.log(error)
            res.json({ msg: "could not delete user" })
        }
    })

    //admin edit user
    app.patch('/admin/edit/:id', authMiddleware, async (req: Request, res: Response) => {
        try {
            let { user, newUsername, newPassword, newEmail, isAdmin  }: { user: User, newUsername: string, newPassword: string, newEmail: string, isAdmin: boolean } = req.body
            if (user.isAdmin) {
                //edit
                let userToEdit = await fetchUser(req.params.id)
                if (!userToEdit) throw new Error("user not found")
                AdminEditUser(userToEdit, newUsername, newPassword, newEmail, isAdmin)
                res.json({ msg: "user edited successfully" })
            } else throw new Error("unauthorized")
        } catch (error) {
            console.log(error)
            res.json({ msg: "could not edit user" })
        }
    })



})()
import express, { Request, Response } from "express";
import appDataSource from "./ormconfig"
import User from "./entities/user";
import cookieParser from 'cookie-parser';
import jwt from "jsonwebtoken"
import { authMiddleware, createToken, deleteToken, generateToken, refreshMiddleware } from "./utilities/token";
import Post from "./entities/post";
import RefreshToken from "./entities/refreshToken";
import { createUser, deleteUser, fetchUser, fetchUserByusrn, saveToDB } from "./controllers/user.controller";
import {  fetchLike, fetchPost, savePost, saveLike, deleteLike, saveComment, fetchComment, deleteComment } from "./controllers/post.constroller";
import bcrypt from "bcrypt"
import Like from "./entities/like"
import Comment from "./entities/comment";
import upload from "./utilities/img";
import fs from 'fs'
import { generateHash } from "./utilities/hash";
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
    app.post('/register', async (req: Request, res: Response) => {
        try {
            let { username, password, email } = req.body
            //creating new user
            let newUser = await createUser(username, password, email, false)
            //creating access&refresh token
            let refresh = await generateToken({ id: newUser.id }, process.env.REFRESH_TOKEN_SECRET!, '30d')
            let accessToken = await generateToken({ id: newUser.id }, process.env.ACCESS_TOKEN_SECRET!, '1d')
            let newToken = createToken(refresh, newUser)
            //saving to database & response 
            await saveToDB(newUser, newToken)
            res.cookie('jwt', refresh, { httpOnly: true }).json({ accessToken })
        } catch (error) {
            console.log(error)
            res.json({ msg: "could not add user" })
        }

    })

    //login
    app.post('/login', async (req: Request, res: Response) => {
        let { username, password } = req.body
        let userByUsername = await fetchUserByusrn(username)
        if (!userByUsername) res.json({ msg: "uncorrect username or plogassword" })
        if (await bcrypt.compare(password, userByUsername!.password)) {
            //creating access&refresh token
            let refresh = await generateToken({ id: userByUsername!.id }, process.env.REFRESH_TOKEN_SECRET!, '1d')
            let accessToken = await generateToken({ id: userByUsername!.id }, process.env.ACCESS_TOKEN_SECRET!, '1d')
            let newToken = createToken(refresh, userByUsername!)
            //savivng to db & response
            await saveToDB(userByUsername!, newToken)
            res.cookie('jwt', refresh, { httpOnly: true }).json({ accessToken })
        } else {
            res.json({ msg: "uncorrect username or password" })
        }
    })

    //logout
    app.post('/logout', authMiddleware, async (req: Request, res: Response) => {
        try {
            let refreshToken = req.cookies.jwt
            let user = await fetchUser(req.body.user.id)
            //updating user
            user?.tokens.filter((token) => token !== refreshToken)
            appDataSource.manager.save(user)
            //deleting token from db
            await deleteToken(refreshToken)
            res.json({ msg: "logged out successfuly" }).clearCookie('jwt')
        } catch (error) {
            console.log(error)
            res.json({ msg: "something went wrong" })
        }

    })

    //edit password
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

    //refresh accessToken route
    app.post('/refresh', refreshMiddleware,  (req: Request, res: Response) => {
        try {
            let user = req.body.user
            //refreshing token
            let data = { id: user.id }
            let newAccessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1d' })
            res.json({ newAccessToken, msg: "token refreshed" })
        } catch (error) {
            console.log(error)
            res.json({ msg: "something went wrong" })
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
            let postToDelete = await fetchPost(req.params.id)
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
            let like = await fetchLike(user.id)
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
            let post = await fetchPost(req.params.postId)
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


})()
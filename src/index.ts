import express, { Request, Response } from "express";
import appDataSource from "./ormconfig"
import User from "./entities/user";
import cookieParser from 'cookie-parser';
import jwt from "jsonwebtoken"
import { authMiddleware, createToken, deleteToken, generateToken, refreshMiddleware } from "./utilities/token";
import Post from "./entities/post";
import RefreshToken from "./entities/refreshToken";
import { createUser, fetchUser, fetchUserByusrn, saveToDB } from "./controllers/user.controller";
import {  fetchLike, fetchPost, savePost, saveLike, deleteLike } from "./controllers/post.constroller";
import bcrypt from "bcrypt"
import Like from "./entities/like"
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
            let users = await userRepo.find({ relations: { likes: true } })
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


    //routes
    app.post('/register', async (req: Request, res: Response) => {
        try {
            let { username, password, email } = req.body
            //creating new user
            let newUser = await createUser(username, password, email)
            //creating access&refresh token
            let refresh = await generateToken({ id: newUser.id }, process.env.REFRESH_TOKEN_SECRET!, '1d')
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
   app.post('/addPost', authMiddleware, async (req: Request, res: Response) => {
        try {
            let { caption, imageUrl, user } = req.body
            await savePost(caption, imageUrl, user)
            res.json({ msg: "post added successfuly" })
        } catch (error) {
            console.log(error)
            res.json({ msg: "could not add post" })
        }
   })

   //get all posts
    app.get('/allPosts', authMiddleware, async (req: Request, res: Response) => {
        try {
            let postRepo = appDataSource.getRepository(Post)
            let posts = await postRepo.find({ relations: { likes: true } })
            res.json({ posts })
        } catch (error) {
            console.log(error)
            res.json({ msg: "could not fetch posts" })
        }
    })


    
    app.post('/post/:id/like', authMiddleware, async (req: Request, res: Response) => {
        try {
            let user: User = req.body.user
            let post = await fetchPost(req.params.id)
            if (!post) throw new Error("post not found!")
            //checking if already liked, and dislike if so
            let like = await fetchLike(user.id)
            if (!like) {
                //Like
                user.likes.push(await saveLike(user, post))
                appDataSource.manager.save(user)
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


})()
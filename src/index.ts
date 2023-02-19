import express, { Request, Response } from "express";
import appDataSource from "./ormconfig"
import User from "./entities/user";
import cookieParser from 'cookie-parser';
import jwt from "jsonwebtoken"
import { authMiddleware, authToken, createToken, deleteToken, generateToken } from "./utilities/token";
import Post from "./entities/post";
import RefreshToken from "./entities/refreshToken";
import { createUser, fetchUser, fetchUserByusrn, saveToDB } from "./controllers/user.controller";
import { savePost } from "./controllers/post.constroller";
import bcrypt from "bcrypt"
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
            let users = await userRepo.find({ relations: { tokens: true, posts: true } })
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
        if (!userByUsername) res.json({ msg: "uncorrect username or password" })
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
            res.json({ msg: "logged out successfuly" })
        } catch (error) {
            console.log(error)
            res.json({ msg: "something went wrong" })
        }

    })

    app.post('/refresh', async (req: Request, res: Response) => {
        //let refreshToken = req.cookies.jwt
        let refreshToken = req.body.refreshToken
        if (!refreshToken) res.json({ msg: "unauthorized" })
        else {
            let decoded = await authToken(refreshToken, process.env.REFRESH_TOKEN_SECRET!)
            if (!decoded) {
            res.json({ msg: "unvalid token" })
            } else {
            //verify if user exist
            try {
                //refresh token verification
                let userRepo = await appDataSource.getRepository(User)
                let user = await userRepo.findOne({ where: { id: decoded.id } })
                let refreshRepo = await appDataSource.getRepository(RefreshToken)
                let storedREtoken = await refreshRepo.findOne({ relations: {user: true } , where: {token: refreshToken} })
                if (!user || !storedREtoken || user.id !== storedREtoken.user.id) res.json({msg: "unauthorized, please login"})
                //refreshing token
                let data = { username: user?.username, email: user?.email, id: user?.id }
                let newAccessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1m' })
                res.json({ accessToken: newAccessToken, msg: "token refreshed"})
            } catch (err) {
                console.log(err)
                res.json({ msg: "unauthorized" })
            }
        }
        }
    })


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


    app.get('/allPosts', authMiddleware, async (req: Request, res: Response) => {
        try {
            let postRepo = appDataSource.getRepository(Post)
            let posts = await postRepo.find()
            res.json({ posts })
        } catch (error) {
            console.log(error)
            res.json({ msg: "could not fetch posts" })
        }
    })


})()
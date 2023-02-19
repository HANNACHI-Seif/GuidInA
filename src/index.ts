import express, { Request, Response } from "express";
import appDataSource from "./ormconfig"
import User from "./entities/user";
import cookieParser from 'cookie-parser';
import jwt from "jsonwebtoken"
import { authMiddleware, authToken, createToken, generateToken } from "./utilities/token";
import Post from "./entities/post";
import RefreshToken from "./entities/refreshToken";
import { createUser, saveToDB } from "./controllers/user.controller";
require("dotenv").config();

//routes
(async() => {
    await appDataSource.initialize()
    
    const app = express()

    //midddleware
    app.use(express.json())
    app.use(cookieParser())

    app.listen(3000, () => console.log("listening..."))

    //testing routes:
    app.get('/allUsers', async (req: Request, res: Response) => {
        try {
            let userRepo = appDataSource.getRepository(User)
            let users = await userRepo.find({ relations: { tokens: true } })
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
            //saving to database
            saveToDB(newUser, newToken)
            res.cookie('jwt', refresh, { httpOnly: true }).json({ accessToken })
        } catch (error) {
            console.log(error)
            res.json({ msg: "could not add user" })
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

    /*
    app.post('/addPost', async (req: Request, res: Response) => {
        let authHeader = req.headers['authorization']
        let token = authHeader?.split(' ')[1] //bearer token, 1 represents token
        if (!token) {
            res.json({ msg: "unauthorized" })
        } else {
            let user = await authToken(token, process.env.ACCESS_TOKEN_SECRET!)
            if (!user) {
                res.json({ msg: "unvalid token" })
            } else { 
                try {
                    let newPost = new Post()
                    newPost.caption = req.body.caption
                    newPost.imageUrl = req.body.imageUrl
                    newPost.user = user
                    await appDataSource.manager.save(newPost)
                    res.json({ msg: "post added successfuly" })
                } catch (err) {
                    console.log(err);
                    res.json({ msg: "could not add post" })
                }
            }
        }
    })
    */
   app.post('/addPost', authMiddleware, (req: Request, res: Response) => {
        
   })


    app.get('/allPosts', authMiddleware, (req: Request, res: Response) => {
        try {
            let postRepo = appDataSource.getRepository(Post)
            let posts = postRepo.find()
            res.json({ posts })
        } catch (error) {
            console.log(error)
            res.json({ msg: "could not fetch posts" })
        }
    })


})()
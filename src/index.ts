import express, { Request, Response } from "express";
import appDataSource from "./ormconfig"
import User from "./entities/user";
import cookieParser from 'cookie-parser';
import jwt from "jsonwebtoken"
import { authToken, generateToken, storeREToken } from "./utilities/token";
import Post from "./entities/post";
import RefreshToken from "./entities/refreshToken";
import { generateHash } from "./utilities/hash";
require("dotenv").config();

//routes
(async() => {
    await appDataSource.initialize()
    
    const app = express()

    //midddleware
    app.use(express.json())
    app.use(cookieParser())

    app.listen(3000, () => console.log("listening..."))


    //routes
    app.post('/register',async (req:Request, res: Response) => {
        try {
            let { username, email, passwd } = req.body;
            let newUser = new User;
            newUser.username = username;
            newUser.email = email
            newUser.password = await generateHash(passwd)  
            let addedUser = await appDataSource.manager.save(newUser)
            //token
            let { password,...user} = addedUser
            let { accessToken, refreshToken } = await generateToken(user, process.env.ACCESS_TOKEN_SECRET!, process.env.REFRESH_TOKEN_SECRET!, '1m', '1d')
            await storeREToken(refreshToken, addedUser)
            //response
            res.cookie('jwt', refreshToken, { httpOnly: true, secure: true }).json({ accessToken, refreshToken, msg: "user created successfuly" })
        }
        catch (err) {
            console.log(err);
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


    app.get('/allPosts', async (req: Request, res: Response) => {
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
                    let postRepo = appDataSource.getRepository(Post)
                    let posts = await postRepo.find()
                    res.json({posts})
                } catch (err) {
                    console.log(err);
                    res.json({ msg: "could not fetch post" })
                }
            }
        }
    })

    /*app.post('/login', async(req: Request, res: Response) => {
        let userRepo = appDataSource.getRepository(User)
        let userByUsername = await userRepo.findOne({ where: { username: req.body.username } })
        try {
            if (await bcrypt.compare(req.body.password, userByUsername!.password)) {
                res.json({ msg: "login successful" })
            } else res.json({ msg: "wrong password" })
        } catch (err) {
            console.log(err)
            res.json({ msg: "wrong credentials"})
        }
    })*/

})()
import express, { Request, Response } from "express";
import appDataSource from "./ormconfig"
import User from "./entities/user";
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import { authToken } from "./utilities/token";
import Post from "./entities/post";
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
            let salt = await bcrypt.genSalt()//hash
            newUser.password = await bcrypt.hash(passwd, salt)  
            let { password,...user} = await appDataSource.manager.save(newUser)
            //token
            let accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!)
            res.json({ accessToken, msg: "user created successfuly" })
        }
        catch (err) {
            console.log(err);
            res.json({ msg: "could not add user" })
        }
    })



    app.post('/addPost', async (req: Request, res: Response) => {
        let authHeader = req.headers['authorization']
        let token = authHeader?.split(' ')[1] //bearer token, 1 represents token
        if (!token) {
            res.json({ msg: "unauthorized" })
        } else {
            let user = await authToken(token)
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
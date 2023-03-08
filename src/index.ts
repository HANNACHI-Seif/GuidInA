import express, { Request, Response } from "express";
import appDataSource from "./ormconfig"
import User from "./entities/user";
import cookieParser from 'cookie-parser';
import RefreshToken from "./entities/refreshToken";
import Like from "./entities/like"
import Comment from "./entities/comment";
import authRoutes from './routes/authRoutes'
import postRoutes from './routes/postRoutes'
import adminRoutes from './routes/adminRoutes'
import destRoutes from './routes/destRoutes'
import Destination from "./entities/destination";
import Dest_Image from "./entities/dest_image";
declare global {
    namespace Express {
      interface Request {
        user?: User;
      }
    }
  }
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

    app.get('/allDest', async(req: Request, res: Response) => {
        try {
            let destRepo = appDataSource.getRepository(Destination)
            let destinations = await destRepo.find({ relations: { images: true } })
            res.json({ destinations })
        } catch (error) {
            console.log(error)
            res.json({ msg: "could not fetch destination" })
        }
    })

    app.get('/allDestImages', async(req: Request, res: Response) => {
        try {
            let destImageRepo = appDataSource.getRepository(Dest_Image)
            let destImages = await destImageRepo.find()
            res.json({ destImages })
        } catch (error) {
            console.log(error)
            res.json({ msg: "could not fetch destinations' images" })
        }
    })




    //routes
    //auth routes
    app.use('/user', authRoutes)
  
    //posts routes
    app.use('/post', postRoutes)

    //admin routes
    //user
    app.use('/admin', adminRoutes)

    //destination routes
    app.use('/destination', destRoutes)

    //hotel routes




})()
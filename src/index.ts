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
import userReviewRoutes from './routes/userReviewRoutes';
import hotelRoutes from './routes/hotelRoutes';
import restaurantRoutes from './routes/restaurantRoutes'
import destReviewRoutes from './routes/destReviewRoutes'
import Destination from "./entities/destination";
import Dest_Image from "./entities/dest_image";
import User_review from "./entities/user_review";
import Restaurant from "./entities/restaurant";
import Hotel from "./entities/hotel";
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
            let users = await userRepo.find({ relations: { 
                likes: true, 
                comments: true, 
                tokens: true, 
                posts: true, 
                myReviews: true,
            } })
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
            let destinations = await destRepo.find({ relations: { images: true, reviews: true } })
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

    app.get('/allReviews', async (req: Request, res: Response) => {
        let userReviewRepo = appDataSource.getRepository(User_review)
        let reviews = await userReviewRepo.find({ relations: {user: true, ratedUser: true} })
        res.json({ reviews })
    })

    app.get('/allRestaurants', async (req: Request, res: Response) => {
        try {
            let restRepo = appDataSource.getRepository(Restaurant)
            let restaurants = await restRepo.find({relations: { images: true }});
            res.json({restaurants})
        } catch (error) {
            console.log(error)
            res.json({ msg: "could not fetch restaurants" })
        }
    })

    app.get('/allHotels', async (req: Request, res: Response) => {
        try {
            let hotelRepo = appDataSource.getRepository(Hotel)
            let hotels = await hotelRepo.find({ relations: { images: true } })
            res.json({ hotels })
        } catch (error) {
            console.log(error)
            res.json({ msg: "could not fetch hotels" })
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

    //user review routes
    app.use('/user-reviews', userReviewRoutes)

    //destination routes
    app.use('/destination', destRoutes)

    //destination reviews
    app.use('/destination-reviews', destReviewRoutes)

    //hotel routes
    app.use('/hotel', hotelRoutes)

    //restaurant routes
    app.use('/restaurant', restaurantRoutes)


    //FINISH REVVIEWS
    //TODO: reviews for destinations/restaurants/hotels
    //TODO: car posts / house posts
    //TODO: role application form
    //TODO: error handling of everything else
    




})()
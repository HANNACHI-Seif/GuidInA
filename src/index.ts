//important imports
import express, { Request, Response } from "express";
import appDataSource from "./ormconfig"
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
config();

//routes imports
import authRoutes from './routes/authRoutes'
import postRoutes from './routes/postRoutes'
import adminRoutes from './routes/adminRoutes'
import destRoutes from './routes/destRoutes'
import userReviewRoutes from './routes/userReviewRoutes';
import hotelRoutes from './routes/hotelRoutes';
import restaurantRoutes from './routes/restaurantRoutes'
import destReviewRoutes from './routes/destReviewRoutes'
import hotelReviewRoutes from './routes/hotelReviewRoutes'
import restReviewRoutes from './routes/restReviewRoutes'

//test imports
import Destination from "./entities/destination";
import Dest_Image from "./entities/dest_image";
import User_review from "./entities/user_review";
import Restaurant from "./entities/restaurant";
import Hotel from "./entities/hotel";
import Comment from "./entities/comment";
import RefreshToken from "./entities/refreshToken";
import Like from "./entities/like"
import User from "./entities/user";
import Role from "./entities/role";
import roles from "./constants/roles";
import { fetchUserByusrn } from "./middleware/user.middleware";

declare global {
    namespace Express {
      interface Request {
        user?: User;
      }
    }
  }




(async() => {
    await appDataSource.initialize()
    
    const app = express()

    //midddleware
    app.use(express.json())
    app.use(cookieParser())

    app.listen(process.env.PORT, () => console.log("listening..."))

    //testing routes:
    app.post('/create_roles', async (req: Request, res: Response) => {
        try {
            let tourist = new Role()
            tourist.roleName = roles.TOURIST
            let admin = new Role()
            admin.roleName = roles.ADMIN
            let guide = new Role()
            guide.roleName = roles.GUIDE
            let carRenter = new Role()
            carRenter.roleName = roles.CAR_RENTOR
            let houseRenter = new Role()
            houseRenter.roleName = roles.HOUSE_RENTOR
            let translator = new Role()
            translator.roleName = roles.TRANSLATOR
            await appDataSource.manager.save([tourist, admin, translator, guide, carRenter, houseRenter])
            res.json({ msg: "roles created!" })
        } catch (error) {
            console.log(error)
            res.json({ msg: "failed" })
        }
    })

    app.get('/roles', async (req: Request, res: Response) => {
        try {
            let roles = await appDataSource.getRepository(Role).find()
            res.json({ roles })
        } catch (error) {
            console.log(error)
            res.json({ msg: "failed" })
        }
    })

    app.post('/make_admin', async (req: Request, res: Response) => {
        try {
            let { username } = req.body
            let user = await appDataSource.getRepository(User).findOne({ where: { username: username }, relations: { roles: true } })
            let admin = await appDataSource.getRepository(Role).findOne({ where: { roleName: roles.ADMIN } })
            user?.roles.push(admin!)
            await appDataSource.manager.save(user)
            res.json({ msg: "this user is now admin" })
        } catch (error) {
            console.log(error)
            res.json({ msg: error.message })
        }
    })

    app.get('/allUsers', async (req: Request, res: Response) => {
        try {
            let userRepo = appDataSource.getRepository(User)
            let users = await userRepo.find({ relations: { 
                likes: true, 
                comments: true, 
                tokens: true, 
                posts: true, 
                myReviews: true,
                roles: true 
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
            let restaurants = await restRepo.find({relations: { images: true, reviews: true }});
            res.json({restaurants})
        } catch (error) {
            console.log(error)
            res.json({ msg: "could not fetch restaurants" })
        }
    })

    app.get('/allHotels', async (req: Request, res: Response) => {
        try {
            let hotelRepo = appDataSource.getRepository(Hotel)
            let hotels = await hotelRepo.find({ relations: { images: true, reviews: true } })
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

    //destination review routes
    app.use('/destination-reviews', destReviewRoutes)

    //hotel routes
    app.use('/hotel', hotelRoutes)

    //hotel review routes
    app.use('/hotel-reviews', hotelReviewRoutes)

    //restaurant routes
    app.use('/restaurant', restaurantRoutes)

    //restaurant review routes
    app.use('/restaurant-reviews', restReviewRoutes)


    //TODO: user can have multiple roles
    //TODO: car posts / house posts
    //TODO: role application form
    
    




})()
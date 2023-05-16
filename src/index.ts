//important imports
import express, { Request, Response } from "express";
import appDataSource from "./ormconfig"
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';


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
import roleApplicationRoutes from './routes/roleApplicationRoutes'

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
import Language from "./entities/language";
import Languages from "./constants/languages";
import { generateHash } from "./utilities/hash";
import { generateToken } from "./utilities/token";
import Decimal from "decimal.js";

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
    config();

    //midddleware
    app.use(express.json())
    app.use(cookieParser())

    app.listen(process.env.PORT, () => console.log("listening..."))

    //testing routes:
    app.post('/TEST',async (req:Request, res: Response) => {
        try {
            //roles
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
            //languages:
            let english = new Language()
            english.name = Languages.ENGLISH
            let french = new Language()
            french.name = Languages.FRENCH
            let kabyle = new Language()
            kabyle.name = Languages.KABYLE
            let arabic = new Language()
            arabic.name = Languages.ARABIC
            await appDataSource.manager.save([english, french, kabyle, arabic])
            //admin
            let admin_user = new User()
            admin_user.email = "admin@gmail.com"
            admin_user.password = await generateHash("rootroot")
            admin_user.roles = [(await appDataSource.getRepository(Role).findOne({ where: { roleName: roles.ADMIN } }))!]
            admin_user.username = "admin"
            admin_user.rating = new Decimal(0)
            //dummy user
            let dummy = new User()
            dummy.email = "dummy@gmail.com"
            dummy.password = await generateHash("coolpassword")
            dummy.roles = [(await appDataSource.getRepository(Role).findOne({ where: { roleName: roles.TOURIST } }))!]
            dummy.username = "dummy"
            dummy.rating = new Decimal(0)
            //preparing response
            let admin_result = await appDataSource.manager.save(admin_user)
            let dummy_result = await appDataSource.manager.save(dummy)
            let admin_access_token = await generateToken({ id: admin_result.id }, process.env.ACCESS_TOKEN_SECRET!, "30d")
            let dummy_access_token = await generateToken({ id: dummy_result.id }, process.env.ACCESS_TOKEN_SECRET!, "30d")
            let res_roles = await appDataSource.getRepository(Role).find()
            let res_languages = await appDataSource.getRepository(Language).find()
            //response
            res.json({
                admin_access_token,
                dummy_access_token,
                res_roles,
                res_languages
            })
        } catch (error) {
            res.json({ msg: "failed" })
            console.log(error)
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

    app.get('/allUsers', async (req: Request, res: Response) => {
        try {
            let userRepo = appDataSource.getRepository(User)
            let users = await userRepo.find({ relations: {
                roles: true,
                tokens: true,
                profile: true,
                form: true
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

    //special role application
    app.use('/special_role', roleApplicationRoutes)


    //TODO: VALIDATION
    
    




})()
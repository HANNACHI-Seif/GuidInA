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
import carPostRoutes from './routes/carPostRoutes'
import housePostRoutes from './routes/housePostRoutes'

//test imports
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
            carRenter.roleName = roles.CAR_RENTER
            let houseRenter = new Role()
            houseRenter.roleName = roles.HOUSE_RENTER
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

    //car renter posts
    app.use('/car_posts', carPostRoutes)

    //house renter posts
    app.use('/house_posts', housePostRoutes)


    //TODO: VALIDATION
    

})()
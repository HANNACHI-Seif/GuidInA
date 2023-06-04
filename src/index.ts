//important imports
import express, { Request, Response } from "express";
import appDataSource from "./ormconfig"
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import cors from 'cors'


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
import searchRoutes from './routes/searchRoutes'
import userRoutes from './routes/userRoutes'

//test imports
import User from "./entities/user";
import Role from "./entities/role";
import roles from "./constants/roles";
import Language from "./entities/language";
import Languages from "./constants/languages";
import { generateHash } from "./utilities/hash";
import { generateToken } from "./utilities/token";
import Decimal from "decimal.js";
import Destination from "./entities/destination";
import Restaurant from "./entities/restaurant";
import Hotel from "./entities/hotel";


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
    app.use(cors({origin: "http://localhost:3000", credentials: true}, ))



    //midddleware
    app.use(express.json())
    app.use(cookieParser())

    app.listen(process.env.PORT, () => console.log(`listening in port ${process.env.PORT}`))

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
            dummy.email_confirmed = true
            //preparing response
            let admin_result = await appDataSource.manager.save(admin_user)
            let dummy_result = await appDataSource.manager.save(dummy)
            let admin_access_token = await generateToken({ id: admin_result.id }, process.env.ACCESS_TOKEN_SECRET!, "30d")
            let dummy_access_token = await generateToken({ id: dummy_result.id }, process.env.ACCESS_TOKEN_SECRET!, "30d")
            let res_roles = await appDataSource.getRepository(Role).find()
            let res_languages = await appDataSource.getRepository(Language).find()
            //creating a destination, hotel, restaurant
            let dest = new Destination()
            dest.city = "oran"
            dest.description = "some destination description"
            dest.maps_link = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1619.9731217502276!2d-0.6512254593335894!3d35.70294044521683!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd7e88e4d71ec7ef%3A0x93db231abcfcedd4!2sPlace%20Premier%20November%201954%2C%20Oran!5e0!3m2!1sfr!2sdz!4v1685749685157!5m2!1sfr!2sdz"
            dest.name = "Place D'arm"
            dest.rating = new Decimal(0)
            await appDataSource.manager.save(dest)
            let rest = new Restaurant()
            rest.city = "oran"
            rest.description = "some restaurant description"
            rest.type = "traditional"
            rest.maps_link = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5330.440721380961!2d-0.6353155359937026!3d35.6994119572659!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd7e8852ea57cc01%3A0x71c58268e0aa0a17!2sEL%20BEY%20RESTAURANT!5e0!3m2!1sfr!2sdz!4v1685751643568!5m2!1sfr!2sdz"
            rest.name = "El Bey Restaurant"
            rest.rating = new Decimal(0)
            await appDataSource.manager.save(rest)
            let hotel = new Hotel()
            hotel.city = "oran"
            hotel.description = "some hotel description"
            hotel.maps_link = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1100.295926039141!2d-0.6389736618925026!3d35.67057488696411!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd7e893793d1b31d%3A0xbbe2c3ad8339963e!2sRODINA%20H%C3%B4tel%2C%20SPA!5e0!3m2!1sfr!2sdz!4v1685751893296!5m2!1sfr!2sdz"
            hotel.stars = 4
            hotel.name = "Rodina"
            hotel.rating = new Decimal(0)
            await appDataSource.manager.save(hotel)
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

    //search
    app.use('/search', searchRoutes)

    //user utils routes
    app.use('/user_utils', userRoutes)


    //TODO: VALIDATION
    

})()
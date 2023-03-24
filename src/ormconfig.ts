import { DataSource } from 'typeorm'
import User from './entities/user'
import Post from './entities/post'
import Like from './entities/like'
import Comment from './entities/comment'
import RefreshToken from './entities/refreshToken'
import Destination from './entities/destination'
import Dest_Image from './entities/dest_image'
import User_review from './entities/user_review'
import Restaurant from './entities/restaurant'
import Restaurant_Image from './entities/restaurant_image'
import Hotel from './entities/hotel'
import Hotel_Image from './entities/hotel_image'
import Dest_Review from './entities/dest_review'

export default new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "seifon",
    password: "",
    database: "auth_db",
    synchronize: true,
    logging: false,
    entities: [User, Post, Comment, Like, RefreshToken, Destination , Dest_Image, User_review, Restaurant, Restaurant_Image, Hotel, Hotel_Image, Dest_Review],
    subscribers: [],
    migrations: [], 
})
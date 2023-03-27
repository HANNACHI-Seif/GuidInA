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
import Rest_Image from './entities/rest_image'
import Hotel from './entities/hotel'
import Hotel_Image from './entities/hotel_image'
import Dest_Review from './entities/dest_review'
import Hotel_Review from './entities/hotel_review'
import Rest_Review from './entities/rest_review'
import Role from './entities/role'

export default new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "seifon",
    password: "",
    database: "guidina",
    synchronize: true,
    logging: false,
    entities: [ User, Post, Comment, Like, RefreshToken, User_review, Role,
                Destination , Dest_Image, Dest_Review,
                Restaurant, Rest_Image, Rest_Review,
                Hotel, Hotel_Image, Hotel_Review ],
    subscribers: [],
    migrations: [], 
})
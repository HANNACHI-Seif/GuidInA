import { DataSource } from 'typeorm'
import User from './entities/user'
import Post from './entities/post'
import Like from './entities/like'
import Comment from './entities/comment'
import RefreshToken from './entities/refreshToken'
import Destination from './entities/destination'
import Restaurant from './entities/restaurant'
import Hotel from './entities/hotel'
import Hotel_Image from './entities/hotel_image'
import Dest_Image from './entities/dest_image'
import Restaurant_Image from './entities/restaurant_image'

export default new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "seifon",
    password: "",
    database: "auth_db",
    synchronize: true,
    logging: false,
    entities: [User, Post, Comment, Like, RefreshToken, Destination, Restaurant, Hotel, Hotel_Image, Dest_Image, Restaurant_Image],
    subscribers: [],
    migrations: [], 
})
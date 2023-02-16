import { DataSource } from 'typeorm'
import User from './entities/user'
import Post from './entities/post'
import Like from './entities/like'
import Comment from './entities/comment'
import RefreshToken from './entities/refreshToken'

export default new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "seifon",
    password: "",
    database: "auth_db",
    synchronize: true,
    logging: false,
    entities: [User, Post, Comment, Like, RefreshToken],
    subscribers: [],
    migrations: [],
})
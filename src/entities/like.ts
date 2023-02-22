import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import User from "./user";
import Post from './post'


@Entity()
export default class Like {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ManyToOne( () => User, user => user.likes)
    user: User

    @ManyToOne(() => Post)
    post: Post

}
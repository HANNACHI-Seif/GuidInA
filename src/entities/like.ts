import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import User from "./user";
import Post from './post'


@Entity()
export default class Like {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ManyToOne( () => User, user => user.likes, { onDelete: "CASCADE" })
    user: User

    @ManyToOne(() => Post, post => post.likes, { onDelete: "CASCADE" })
    post: Post

}
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import User from "./user";
import  Post  from "./post";


@Entity()
export default class Comment {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    text: string

    @ManyToOne(() => User, user => user.comments, { onDelete: "CASCADE" })
    user: User

    @ManyToOne(() => Post, post => post.comments, { onDelete: "CASCADE" })
    post: Post

}
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm"
import User from "./user"
import Like from "./like"
import Comment from './comment'


@Entity()
export default class Post {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    caption: string

    @Column()
    imageUrl: string

    @ManyToOne(() => User, user => user.posts, { onDelete: "CASCADE" })
    user: User

    @OneToMany( () => Comment, comment => comment.post)
    @JoinColumn()
    comments: Comment[]

    @OneToMany( () => Like, like => like.post)
    @JoinColumn()
    likes: Like[]

}
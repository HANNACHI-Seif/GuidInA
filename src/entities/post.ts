import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm"
import User from "./user"
import Like from "./like"
import Comment from './comment'
import Post_Image from "./post_image"


@Entity()
export default class Post {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    caption: string

    @OneToMany(() => Post_Image, post_image => post_image.post, { cascade: true }) 
    @JoinColumn() 
    images: Post_Image[]

    @ManyToOne(() => User, user => user.posts, { onDelete: "CASCADE" })
    user: User

    @OneToMany( () => Comment, comment => comment.post)
    @JoinColumn()
    comments: Comment[]

    @OneToMany( () => Like, like => like.post)
    @JoinColumn()
    likes: Like[]

}
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Post from "./post";


@Entity()
export default class Post_Image {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    url: string

    @ManyToOne(() => Post, post => post.images, { onDelete: "CASCADE" })
    post: Post

}
import { BeforeRemove, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import House_Post from "./house_post";
import fs from 'fs'


@Entity()
export default class House_Image {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    url: string

    @ManyToOne(() => House_Post, house_post => house_post.images, { onDelete: "CASCADE" })
    house_post: House_Post

    @BeforeRemove()
    removeImage() {
        if (fs.existsSync(this.url)) {
            fs.unlinkSync(this.url)
        }
    }
}
import { BeforeRemove, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Car_Post from "./car_post";
import fs from "fs";


@Entity()
export default class Car_Image {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    url: string

    @ManyToOne(() => Car_Post, car_post => car_post.images, { onDelete: "CASCADE" })
    car_post: Car_Post

    @BeforeRemove()
    removeImage() {
        if (fs.existsSync(this.url)) {
            fs.unlinkSync(this.url)
        }
    }

}
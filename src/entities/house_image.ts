import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import House_Post from "./house_post";


@Entity()
export default class House_Image {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    url: string

    @ManyToOne(() => House_Post, house_post => house_post.images)
    car_post: House_Post

}
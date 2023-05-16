import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Special_User_Profile from "./special_user_profile";
import Car_Image from "./car_image";


@Entity()
export default class Car_Post {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    description: string

    @Column()
    doors: string

    @Column({ default: true})
    isAvailable: boolean

    @ManyToOne(() => Special_User_Profile, profile => profile.car_posts)
    profile: Special_User_Profile

    @OneToMany(() => Car_Image, car_image => car_image.car_post)
    images: Car_Image[]

}
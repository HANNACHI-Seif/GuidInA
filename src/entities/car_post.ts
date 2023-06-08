import { BeforeRemove, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Special_User_Profile from "./special_user_profile";
import Car_Image from "./car_image";
import carSeats from "../constants/carSeats";


@Entity()
export default class Car_Post {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    car_name: string

    @Column()
    description: string

    @Column()
    seats: carSeats

    @Column()
    price: number

    @Column({ default: true})
    isAvailable: boolean

    @ManyToOne(() => Special_User_Profile, profile => profile.car_posts)
    profile: Special_User_Profile

    @OneToMany(() => Car_Image, car_image => car_image.car_post, { cascade: true })
    images: Car_Image[]

    @BeforeRemove()
    removeImagesAndFiles() {
        for (const image of this.images) {
          image.removeImage();
        }
    }

    remove(): void {
        this.removeImagesAndFiles()
    }

    

}
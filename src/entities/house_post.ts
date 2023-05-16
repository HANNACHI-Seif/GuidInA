import propertyType from "../constants/propertyType";
import { Column, Entity, OneToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Special_User_Profile from "./special_user_profile";
import houseRentPeriod from "../constants/houseRentPeriod";
import House_Image from "./house_image";


@Entity()
export default class House_Post {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    description: string

    @Column()
    property_type: propertyType

    @Column()
    city: string

    @Column()
    rent_by: houseRentPeriod

    @Column()
    isAvailable: boolean

    @ManyToOne(() => Special_User_Profile, profile => profile.house_posts)
    profile: Special_User_Profile

    @OneToMany(() => House_Image, house_image => house_image.car_post)
    images: House_Image[]

}
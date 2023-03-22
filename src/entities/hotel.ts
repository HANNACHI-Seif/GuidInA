import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinTable } from "typeorm"
import Hotel_Image from "./hotel_image"

@Entity()
export default class Hotel {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column()
    city: string

    @Column()
    description: string

    @Column()
    stars: number

    @OneToMany(() => Hotel_Image , hotel_image => hotel_image.hotel, {cascade: true})
    images: Hotel_Image[]


}
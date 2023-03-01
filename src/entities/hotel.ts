import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, OneToMany } from "typeorm"
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

    @OneToMany(() => Hotel_Image, hotel_image => hotel_image.hotel)
    images: Hotel_Image[]
}
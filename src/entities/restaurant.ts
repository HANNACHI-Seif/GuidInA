import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinTable, ManyToMany } from "typeorm"
import Restaurant_Image from "./restaurant_image"

@Entity()
export default class Restaurant {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column()
    city: string

    @Column()
    description: string

    @OneToMany(() => Restaurant_Image, restaurant_image => restaurant_image.restaurant)
    images: Restaurant_Image

}
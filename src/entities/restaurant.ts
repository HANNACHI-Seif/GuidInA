import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinTable } from "typeorm"
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

    @Column()
    type: string

    @OneToMany(() => Restaurant_Image , rest_image => rest_image.restaurant, {cascade: true})
    images: Restaurant_Image[]


}
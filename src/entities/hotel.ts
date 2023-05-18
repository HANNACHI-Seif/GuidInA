import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import Hotel_Image from "./hotel_image"
import Hotel_Review from "./hotel_review"
import DecimalTransformer from "../utilities/float._."
import Decimal from "decimal.js"

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
    maps_link: string

    @Column()
    stars: number

    @Column( "decimal", { default: new Decimal(0), precision: 6, scale: 1, transformer: new DecimalTransformer()})
    rating: Decimal

    @OneToMany(() => Hotel_Image , hotel_image => hotel_image.hotel, {cascade: true})
    images: Hotel_Image[]

    @OneToMany(() => Hotel_Review, hotel_image => hotel_image.hotel, { cascade: true })
    reviews: Hotel_Review[]

}
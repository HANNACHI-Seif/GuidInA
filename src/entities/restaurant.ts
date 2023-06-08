import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import Rest_Image from "./rest_image"
import Rest_Review from "./rest_review"
import DecimalTransformer from "../utilities/float._."
import Decimal from "decimal.js"

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

    @Column({ type: "text" })
    maps_link: string

    @Column( "decimal", { default: new Decimal(0), precision: 6, scale: 1, transformer: new DecimalTransformer()})
    rating: Decimal

    @OneToMany(() => Rest_Image , rest_image => rest_image.restaurant, {cascade: true})
    images: Rest_Image[]

    @OneToMany(() => Rest_Review, rest_review => rest_review.restaurant, {cascade: true})
    reviews: Rest_Review[]


}
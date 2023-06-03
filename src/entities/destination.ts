import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import Dest_Image from "./dest_image"
import Dest_Review from "./dest_review"
import DecimalTransformer from "../utilities/float._."
import Decimal from "decimal.js"


@Entity()
export default class Destination {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column()
    city: string

    @Column()
    description: string

    @Column({ type: "text" })
    maps_link: string

    @Column( "decimal", { default: 0.0, precision: 6, scale: 1, transformer: new DecimalTransformer()})
    rating: Decimal

    @OneToMany(() => Dest_Image, dest_image => dest_image.destination, {cascade: true})
    images: Dest_Image[]

    @OneToMany(() => Dest_Review, dest_review => dest_review.destination, {cascade: true})
    reviews: Dest_Review[]


}
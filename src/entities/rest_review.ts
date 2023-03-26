import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm"
import User from "./user"
import Restaurant from "./restaurant"


@Entity()
export default class Rest_Review {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    text: string

    @Column()
    stars: number

    @ManyToOne(() => Restaurant, restaurant => restaurant.reviews, { onDelete: "CASCADE" })
    restaurant: Restaurant

    @ManyToOne(() => User)
    user: User


}
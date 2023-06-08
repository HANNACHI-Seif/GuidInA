import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm"
import User from "./user"
import Hotel from "./hotel"

@Entity()
export default class Hotel_Review {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    text: string

    @Column()
    stars: number

    @Column()
    isPositive: boolean

    @ManyToOne(() => Hotel, hotel => hotel.reviews, { onDelete: "CASCADE" })
    hotel: Hotel

    @ManyToOne(() => User)
    user: User


}
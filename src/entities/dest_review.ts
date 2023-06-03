import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm"
import User from "./user"
import Destination from "./destination"

@Entity()
export default class Dest_Review {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    text: string

    @Column()
    stars: number

    @Column()
    isPositive: boolean

    @ManyToOne(() => Destination, destinatiion => destinatiion.reviews, { onDelete: "CASCADE" })
    destination: Destination

    @ManyToOne(() => User)
    user: User


}
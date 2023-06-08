import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm"
import User from "./user"

@Entity()
export default class User_review {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    text: string

    @Column()
    stars: number

    @Column()
    isPositive: boolean

    @ManyToOne(() => User, user => user.myReviews)
    ratedUser: User

    @ManyToOne(() => User)
    user: User


}
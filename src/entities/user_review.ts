import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm"
import User from "./user"
import { Max, Min, IsInt } from "class-validator"

@Entity()
export default class User_review {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    text: string

    @Column()
    stars: number

    @ManyToOne(() => User, user => user.myReviews)
    ratedUser: User

    @ManyToOne(() => User)
    user: User


}
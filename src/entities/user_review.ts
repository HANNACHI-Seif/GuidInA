import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToMany, JoinColumn, ManyToOne } from "typeorm"
import User from "./user"

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

    @ManyToOne(() => User, user => user.reviews)
    user: User


}
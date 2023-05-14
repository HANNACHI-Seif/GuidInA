import { IsEmail, IsNotEmpty, Length } from "class-validator"
import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToMany, JoinColumn, ManyToMany, JoinTable, OneToOne } from "typeorm"
import Post from './post'
import Like from "./like"
import RefreshToken from "./refreshToken"
import Comment from "./comment"
import User_review from "./user_review"
import  DecimalTransformer  from "../utilities/float._."
import Decimal from "decimal.js"
import Role from "./role"
import Application_Form from "./application_form"


@Entity()
export default class User {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    @IsNotEmpty({ message: "username is required"})
    @Length(4, 20, { message: "username must be at least $constraint1 and not longer than $constraint2 characters" })
    username: string

    @Column()
    @Unique(['email'])
    @IsEmail({}, { message: "please enter a valid email" })
    @IsNotEmpty({ message: "email is required"})
    email: string

    @Column()
    @IsNotEmpty({ message: "password is required"})
    password: string

    @ManyToMany(() => Role)
    @JoinTable()
    roles: Role[]

    @Column({ default: false })
    email_confirmed: boolean

    @Column( "decimal", {precision: 6, scale: 1, transformer: new DecimalTransformer(), default: 0.0})
    rating: Decimal

    @Column({ default: '' })
    resetToken: string

    @OneToMany( () => Post, post => post.user, { cascade: true })
    @JoinColumn()
    posts: Post[]

    @OneToMany(() => Like, like => like.user, { cascade: true })
    @JoinColumn()
    likes: Like[]

    @OneToMany(() => Comment, comment => comment.user, { cascade: true })
    @JoinColumn()
    comments: Comment[]

    @OneToMany(() => RefreshToken, token => token.user, { cascade: true })
    @JoinColumn()
    tokens: RefreshToken[]

    @OneToMany(() => User_review, review => review.ratedUser)
    myReviews: User_review[]

    @OneToOne(() => Application_Form, form => form.user)
    form: Application_Form


    
}
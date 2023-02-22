import { IsEmail, IsNotEmpty, Length } from "class-validator"
import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToMany, JoinColumn } from "typeorm"
import Post from './post'
import Like from "./like"
import RefreshToken from "./refreshToken"


@Entity()
export default class User {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    @IsNotEmpty({ message: "username is required"})
    @Length(4, 20, { message: "username must be at least $constraint1 and not longer than constraint2 characters" })
    username: string

    @Column()
    @Unique(['email'])
    @IsEmail({}, { message: "please enter a valid email" })
    @IsNotEmpty({ message: "email is required"})
    email: string

    @Column()
    @Length(6, 30, { message: "password must be at least $constraint1 and not longer than constraint2 characters" })
    @IsNotEmpty({ message: "password is required"})
    password: string

    @OneToMany( () => Post, post => post.user)
    posts: Post[]

    @OneToMany(() => Like, like => like.user)
    likes: Like[]

    @Column("boolean", {default: false})
    isAdmin: boolean

    @OneToMany(() => RefreshToken, token => token.user)
    @JoinColumn()
    tokens: RefreshToken[]

    
}
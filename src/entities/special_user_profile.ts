import { Length } from "class-validator";
import { Column, Entity, ManyToMany, JoinTable, PrimaryGeneratedColumn, OneToOne, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import Language from "./language";
import User from "./user";
import House_Post from "./house_post";
import Car_Post from "./car_post";


@Entity()
export default class Special_User_Profile {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({ default: "" })
    @Length(1, 280, { message: "Bio exceeds maximum allowed length, please limit your bio to 280 characters" })
    bio: string

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    city: string

    @Column()
    phonenumber: string

    @ManyToMany(() => Language)
    @JoinTable()
    languages: Language[]

    @OneToOne(() => User, user => user.profile, { onDelete: "CASCADE" })
    user: User

    @OneToMany(() => House_Post, house_post => house_post.profile)
    @JoinColumn()
    house_posts: House_Post[]
    
    @OneToMany(() => Car_Post, car_post => car_post.profile)
    @JoinColumn()
    car_posts: Car_Post[]


}
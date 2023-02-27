import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinTable, ManyToMany } from "typeorm"
import Image from "./image"

@Entity()
export default class Restaurant {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column()
    city: string

    @Column()
    description: string

    @ManyToMany(() => Image)
    @JoinTable()
    images: Image[]

}
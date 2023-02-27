import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from "typeorm"
import Image from "./image"

@Entity()
export default class Destination {
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
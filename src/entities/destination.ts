import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinTable } from "typeorm"
import Dest_Image from "./dest_image"

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

    @Column()
    type: string

    @OneToMany(() => Dest_Image, dest_image => dest_image.destination, {cascade: true})
    images: Dest_Image[]


}
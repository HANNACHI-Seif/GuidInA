import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import Destination from "./destination"
import Hotel from "./hotel"

@Entity()
export default class City {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column()
    description: string

    @OneToMany(() => Destination, destination => destination.city)
    destinations: Destination[]

    @OneToMany(() => Hotel, hotel => hotel.city)
    hotels: Hotel[]

}
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import City from "./city"

@Entity()
export default class Destination {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column()
    description: string

    @ManyToOne(() => City, city => city.destinations)
    city: City


}
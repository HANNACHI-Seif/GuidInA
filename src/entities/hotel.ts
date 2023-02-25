import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import City from "./city"

@Entity()
export default class Hotel {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column()
    description: string

    @ManyToOne(() => City, city => city.hotels)
    city: City


}
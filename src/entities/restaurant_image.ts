import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import Hotel from "./hotel"
import Restaurant from "./restaurant"

@Entity()
export default class Restaurant_Image {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    url: string

    @ManyToOne(() => Restaurant)
    restaurant: Restaurant

}
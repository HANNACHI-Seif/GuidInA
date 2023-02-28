import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import Hotel from "./hotel"

@Entity()
export default class Hotel_Image {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    url: string

    @ManyToOne(() => Hotel)
    hotel: Hotel

}
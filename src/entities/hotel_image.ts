import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import Hotel from "./hotel"

@Entity()
export default class Hotel_Image {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ default: "" })
    url: string

    @ManyToOne(() => Hotel, {onDelete: "CASCADE"})
    hotel: Hotel

}
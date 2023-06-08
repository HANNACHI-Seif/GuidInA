import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import Restaurant from "./restaurant"

@Entity()
export default class Rest_Image {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ default: "" })
    url: string

    @ManyToOne(() => Restaurant, {onDelete: "CASCADE"})
    restaurant: Restaurant

}
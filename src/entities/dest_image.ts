import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import Destination from "./destination"

@Entity()
export default class Dest_Image {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    url: string

    @ManyToOne(() => Destination, {onDelete: "CASCADE"})
    destination: Destination

}
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"

@Entity()
export default class Image {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    url: string


}
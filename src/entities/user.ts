import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"


@Entity()
export default class User {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    username: string

    @Column()
    email: string

    @Column()
    password: string

    @Column()
    isAdmin: {
        type: string,
    }
}
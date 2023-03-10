import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import User from "./user";


@Entity()
export default class RefreshToken {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column('longtext')
    token: string

    @ManyToOne(() => User, user => user.tokens, { onDelete: "CASCADE" })
    @JoinColumn()
    user: User


}
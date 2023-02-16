import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import User from "./user";


@Entity()
export default class RefreshToken {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column('longtext')
    token: string

    @OneToOne(() => User)
    @JoinColumn()
    user: User


}
import roles from "../constants/roles"
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"



@Entity()
export default class Role {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    roleName: roles
 

}
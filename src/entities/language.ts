import languages from "../constants/languages";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export default class Language {
    
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: languages

}
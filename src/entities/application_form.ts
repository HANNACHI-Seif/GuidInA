import { Column, Entity, ManyToOne, ManyToMany, PrimaryGeneratedColumn, JoinTable, OneToOne, JoinColumn } from "typeorm"
import User from "./user"
import Role from "./role"
import { IsNotEmpty, Length, Validate } from "class-validator"
import Language from "./language"
import IsAlgerianPhoneNumber from "../utilities/validators/isAlgerianPhoneNumber"


@Entity()
export default class Application_Form {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @OneToOne(() => Role)
    @JoinColumn()
    role: Role
    
    @IsNotEmpty()
    @Column()
    @Length(13,13, {message: "Uncorrect length" })
    @Validate(IsAlgerianPhoneNumber, { message: "Unvalid phone number, please use an algerian phone number" })
    phoneNumber: string

    @IsNotEmpty()
    @Column()
    @Length(4, 20, { message: 'First name must be between 4 and 20 characters' })
    firstName: string;

    @IsNotEmpty()
    @Column()
    @Length(4, 20, { message: 'Last name must be between 4 and 20 characters' })
    lastName: string;

    @IsNotEmpty()   
    @Column()
    city: string;

    @IsNotEmpty()
    @Column()
    cv_file_url: string;

    @IsNotEmpty()
    @ManyToMany( () => Language)
    @JoinTable()
    languages: Language[]
    
    @ManyToOne(() => User, user => user.form)
    user: User;


}
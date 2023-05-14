import { Column, Entity, ManyToOne, ManyToMany, PrimaryGeneratedColumn, JoinTable, OneToOne } from "typeorm"
import User from "./user"
import Role from "./role"
import { IsNotEmpty, Length, Validate } from "class-validator"
import Language from "./language"

function isAlgerianPhoneNumber(value: string): boolean {
    return /^\+213\d{9}$/.test(value);
}

@Entity()
export default class Application_Form {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @IsNotEmpty()
    @OneToOne(() => Role)
    role: Role
    
    @IsNotEmpty()
    @Column()
    @Validate(isAlgerianPhoneNumber, { message: "Unvalid phone number, please use an algerian phone number" })
    phoneNumber: string

    @IsNotEmpty()
    @Column()
    @Length(4, 20, { message: 'Last name must be between 4 and 20 characters' })
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
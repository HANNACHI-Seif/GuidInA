import User from "../entities/user"
import { generateHash } from "../utilities/hash"
import appDataSource from "../ormconfig"
import Post from "../entities/post"
import fs from 'fs'
import  roles  from "../constants/roles"
import Decimal from "decimal.js"
import Role from "../entities/role"
import { validate } from "class-validator"

interface errors_type {
    field: string,
    errors: string[]
}


let createUser = async (username: string, password: string, email: string, Roles: roles[] = [roles.TOURIST]) => {
    let newUser = new User()
    newUser.username = username
    newUser.email = email
    newUser.roles = []
    Roles.forEach( async(role) => {
        let fetchedRole = await appDataSource.getRepository(Role).findOne({ where: { roleName: role } })
        if (fetchedRole) newUser.roles.push(fetchedRole)
    })
    newUser.rating = new Decimal(0.0);
    newUser.password = (await generateHash(password))!
    //validation:
    const error_response: errors_type[] =[]
    const errors = await validate(newUser)
    for (const error of errors) {
        const field = error.property
        const error_messages = Object.values(error.constraints!)
        error_response.push({field: field, errors: error_messages})
    }

    if (error_response.length > 0) {
        return error_response;
    }

    let userRepo = appDataSource.getRepository(User)
    return await userRepo.save(newUser);
}



let fetchUser = (id: string, obj = {}) => {
    let userRepo = appDataSource.getRepository(User)
    return userRepo.findOne({ where: { id: id }, relations: obj })
}

let fetchUserByusrn = (username: string) => {
    let userRepo = appDataSource.getRepository(User)
    return userRepo.findOne({ where: { username: username }, relations: { tokens: true } })
}

let fetchUserByEmail = (email: string) => {
    let userRepo = appDataSource.getRepository(User)
    return userRepo.findOne({ where: { email: email } })
}

let deleteUser = async (id: string) => {
    try {
        let userRepo = appDataSource.getRepository(User)
        let postRepo = appDataSource.getRepository(Post)
        let userToDelete = await userRepo.findOne({ where: { id: id }, relations: { posts: true } })
        if (userToDelete!.posts) userToDelete?.posts.forEach((post) => {
            postRepo.delete({ id: id })
            if (fs.existsSync(post.imageUrl)) {
                fs.unlinkSync(post.imageUrl);
            }
        })
        userRepo.delete({ id: id })
    } catch (error) {
        console.log(error)
    }
}

let AdminEditUser = async (userToEdit: User, newUsername: string, newPassword: string, newEmail: string, newRole: roles[]) => {
    if (newUsername) userToEdit.username = newUsername
    if (newEmail) userToEdit.email = newEmail
    if (newPassword) userToEdit.password = await generateHash(newPassword)
    if (newRole) newRole.forEach( async (role) => {
        let fetchedRole = await appDataSource.getRepository(Role).findOne({where: { roleName: role } })
        if (fetchedRole) userToEdit.roles.push(fetchedRole)
    } )
    appDataSource.manager.save(userToEdit)
}
//newRole should be an array of roles string example : ["guide", "translator"]

export {
    createUser, 
    fetchUser,
    fetchUserByusrn,
    fetchUserByEmail,
    deleteUser,
    AdminEditUser
}
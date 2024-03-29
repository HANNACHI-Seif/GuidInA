import User from "../entities/user"
import { generateHash } from "../utilities/hash"
import appDataSource from "../ormconfig"
import Post from "../entities/post"
import fs from 'fs'
import  roles  from "../constants/roles"
import Decimal from "decimal.js"
import Role from "../entities/role"
import { validate } from "class-validator"
import Special_User_Profile from "../entities/special_user_profile"

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
    return userRepo.findOne({ where: { username: username }, relations: { tokens: true, roles: true } })
}

let fetchUserByEmail = (email: string) => {
    let userRepo = appDataSource.getRepository(User)
    return userRepo.findOne({ where: { email: email } })
}

let deleteUser = async (id: string) => {
    try {
        let userRepo = appDataSource.getRepository(User)
        let postRepo = appDataSource.getRepository(Post)
        let postsToDelete = await postRepo.createQueryBuilder('post')
        .leftJoinAndSelect('post.images', 'post_image')
            .where('post.userId = :userId', { userId: id })
                .getMany()
        if (postsToDelete) postsToDelete.forEach((post) => {
            postRepo.delete({ id: post.id })
            for (let i of post.images) {
                if (fs.existsSync(i.url)) {
                    fs.unlinkSync(i.url);
                }
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
    
    const error_response: errors_type[] =[]
    const errors = await validate(userToEdit)
    for (const error of errors) {
        const field = error.property
        const error_messages = Object.values(error.constraints!)
        error_response.push({field: field, errors: error_messages})
    }

    if (error_response.length > 0) {
        return error_response;
    }
    return appDataSource.manager.save(userToEdit)
}

let spUserEditProfileMiddleware = async (firstName: string, lastName: string, bio: string, profile: Special_User_Profile) => {
    if ( firstName ) profile.firstName = firstName
    if ( lastName ) profile.lastName = lastName
    if ( bio ) profile.bio = bio
    await appDataSource.manager.save(profile) 
}

let sanitizeUser = (user: User) => {
    let roles: string[] = []
    for (let role of user.roles) {
        roles.push(role.roleName)
    }
    return {
        username: user.username,
        email: user.email,
        id: user.id,
        roles
    }
}

let fetchUserRolesMiddleware = async (userId: string) => {
    let roles:string[] = []
    let user = await appDataSource.getRepository(User)
        .findOne({ where: { id: userId }, relations: { roles: true } })
    for (let role of user?.roles!) {
        roles.push(role.roleName)
    }
    return roles
}

export {
    createUser, 
    fetchUser,
    fetchUserByusrn,
    fetchUserByEmail,
    deleteUser,
    AdminEditUser,
    errors_type,
    spUserEditProfileMiddleware,
    sanitizeUser,
    fetchUserRolesMiddleware
}
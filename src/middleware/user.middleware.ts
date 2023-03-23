import User from "../entities/user"
import { generateHash } from "../utilities/hash"
import appDataSource from "../ormconfig"
import Post from "../entities/post"
import fs from 'fs'
import  roles  from "../constants/roles"
import Decimal from "decimal.js"


let createUser = async (username: string, password: string, email: string, role: string = roles.TOURIST) => {
    let newUser = new User()
    newUser.username = username
    newUser.email = email
    newUser.role = role
    newUser.rating = new Decimal(0.0);
    newUser.password = (await generateHash(password))!
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

let AdminEditUser = async (userToEdit: User, newUsername: string, newPassword: string, newEmail: string, newRole: string) => {
    if (newUsername) userToEdit.username = newUsername
    if (newEmail) userToEdit.email = newEmail
    if (newPassword) userToEdit.password = await generateHash(newPassword)
    if (newRole) userToEdit.role = newRole
    appDataSource.manager.save(userToEdit)
}

export {
    createUser, 
    fetchUser,
    fetchUserByusrn,
    fetchUserByEmail,
    deleteUser,
    AdminEditUser
}
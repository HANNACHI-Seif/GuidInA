import RefreshToken from "../entities/refreshToken"
import User from "../entities/user"
import { generateHash } from "../utilities/hash"
import appDataSource from "../ormconfig"


let createUser = async (username: string, password: string, email: string, admin: boolean) => {
    let newUser = new User()
    newUser.username = username
    newUser.email = email
    newUser.isAdmin = admin
    newUser.password = (await generateHash(password))!
    let userRepo = appDataSource.getRepository(User)
    return await userRepo.save(newUser);
}

let saveToDB = async(user: User, token: RefreshToken) => {
    let tokenRepo = appDataSource.getRepository(RefreshToken)
    try {
        token.user = user
        await tokenRepo.save(token)
    } catch (error) {
        console.log(error)
    }
}

let fetchUser = (id: string, obj = {}) => {
    let userRepo = appDataSource.getRepository(User)
    return userRepo.findOne({ where: { id: id }, relations: obj })
}

let fetchUserByusrn = (username: string) => {
    let userRepo = appDataSource.getRepository(User)
    return userRepo.findOne({ where: { username: username }, relations: { tokens: true } })
}



let deleteUser = async (id: string) => {
    try {
        let userRepo = appDataSource.getRepository(User)
        userRepo.delete({ id: id })
    } catch (error) {
        console.log(error)
    }
}

export {
    createUser,
    saveToDB, 
    fetchUser,
    fetchUserByusrn,
    deleteUser
}
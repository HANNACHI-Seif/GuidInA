import RefreshToken from "../entities/refreshToken"
import User from "../entities/user"
import { generateHash } from "../utilities/hash"
import appDataSource from "../ormconfig"


let createUser = async (username: string, password: string, email: string) => {
    let newUser = new User()
    newUser.username = username
    newUser.email = email
    newUser.password = (await generateHash(password))!
    let userRepo = appDataSource.getRepository(User)
    return await userRepo.save(newUser);
}

let saveToDB = async(user: User, token: RefreshToken) => {
    let userRepo = appDataSource.getRepository(User)
    let tokenRepo = appDataSource.getRepository(RefreshToken)
    try {
        if (!user.tokens) user.tokens = []
        if (!user.likes) user.likes = []
        user.tokens.push(token)
        await userRepo.save(user)
        await tokenRepo.save(token)
    } catch (error) {
        console.log(error)
    }
}

let fetchUser = (id: string) => {
    let userRepo = appDataSource.getRepository(User)
    return userRepo.findOne({ where: { id: id } })// NEED TO BE TRUE: likes, 
}

let fetchUserByusrn = (username: string) => {
    let userRepo = appDataSource.getRepository(User)
    return userRepo.findOne({ where: { username: username }, relations: { tokens: true } })
}

export {
    createUser,
    saveToDB, 
    fetchUser,
    fetchUserByusrn
}
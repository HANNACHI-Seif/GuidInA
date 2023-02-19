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
        user.tokens = [token]
        await userRepo.save(user)
        await tokenRepo.save(token)
    } catch (error) {
        console.log(error)
    }
}

export {
    createUser,
    saveToDB
}
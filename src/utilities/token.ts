import jwt from "jsonwebtoken"
import appDataSource from "../ormconfig"
import User from "../entities/user";
import RefreshToken from "../entities/refreshToken";
require("dotenv").config();


interface DecodedToken {
    id: string
}

let authToken = async (token: string, secret: string) => {
    try {
        let userId: DecodedToken = jwt.verify(token, secret) as DecodedToken;
        let userRepo = appDataSource.getRepository(User)
        let user = await userRepo.findOne({ where: { id: userId.id } })
        return user;
    }
    catch (err) {
        console.log(err);
        return null
    }
}

interface usr {
    id: string,
    username: string,
    email: string
}



let generateToken = async (user: usr, access: string, refresh: string, accExpDate: string, reExpDate: string) =>  {
    return { accessToken: jwt.sign(user, access, {expiresIn: accExpDate}), refreshToken: jwt.sign(user, refresh, {expiresIn: reExpDate}) }
}

let storeREToken = async (refreshToken: string, user: User) => {

    try {
        let refreshRepo = await appDataSource.getRepository(RefreshToken)
        let newREtoken = new RefreshToken()
        newREtoken.token = refreshToken
        newREtoken.user = user
        await refreshRepo.save(newREtoken)
    } catch (err) {
        console.log(err)
    }
}


    


export {
    authToken,
    generateToken,
    storeREToken
}
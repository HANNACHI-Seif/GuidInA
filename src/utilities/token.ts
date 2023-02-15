import jwt from "jsonwebtoken"
import appDataSource from "../ormconfig"
import User from "../entities/user";
require("dotenv").config();


interface DecodedToken {
    id: string
}

let authToken = async (token: string) => {
    try {
        let userId: DecodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as DecodedToken;
        let userRepo = appDataSource.getRepository(User)
        let user = await userRepo.findOne({ where: { id: userId.id } })
        return user;
    }
    catch (err) {
        console.log(err);
        return null
    }
}

export {
    authToken
}
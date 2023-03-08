import {  createUser, fetchUser, fetchUserByusrn } from "../middleware/user.middleware";
import {  createToken, deleteToken, generateToken } from "../utilities/token";
import { generateHash } from "../utilities/hash";
import appDataSource from "../ormconfig"
import { Request, Response } from "express";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"






let register_user = async (req: Request, res: Response) => {
    try {
        let { username, password, email } = req.body
        //creating new user
        let newUser = await createUser(username, password, email)
        //creating access&refresh token
        let refresh = await generateToken({ id: newUser.id }, process.env.REFRESH_TOKEN_SECRET!, '30d')
        let accessToken = await generateToken({ id: newUser.id }, process.env.ACCESS_TOKEN_SECRET!, '1d')
        await createToken(refresh, newUser)
        //response 
        res.cookie('jwt', refresh, { httpOnly: true }).json({ accessToken })
        //res.json({ accessToken, refresh })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not add user" })
    }

}

let loginUser = async (req: Request, res: Response) => {
    try {
        let { username, password } = req.body
        let userByUsername = await fetchUserByusrn(username)
        if (!userByUsername) throw new Error("uncorrect username or password!")
        if (await bcrypt.compare(password, userByUsername!.password)) {
            //creating access&refresh token
            let refresh = await generateToken({ id: userByUsername!.id }, process.env.REFRESH_TOKEN_SECRET!, '30d')
            let accessToken = await generateToken({ id: userByUsername!.id }, process.env.ACCESS_TOKEN_SECRET!, '1d')
            await createToken(refresh, userByUsername!)
            //response
            res.cookie('jwt', refresh, { httpOnly: true }).json({ accessToken })
        } else throw new Error("uncorrect username or password!")
    } catch (error) {
        console.log(error)
        res.json({ msg: error })
    }
}

let logoutUser = async (req: Request, res: Response) => {
    try {
        let refreshToken = req.cookies.jwt
        if (!refreshToken) throw new Error("something went wrong")
        let user = await fetchUser(req.user!.id, { tokens: true })
        if ((user?.tokens.some((token) => token == refreshToken))) throw new Error("something went wrong") 
        //deleting token from db
        deleteToken(refreshToken)
        res.clearCookie('jwt').json({ msg: "logged out successfuly" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "something went wrong" })
    }

}

let refreshAccessToken = (req: Request, res: Response) => {
    try {
        let user = req.user!
        //refreshing token
        let data = { id: user.id }
        let newAccessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1d' })
        res.json({ newAccessToken, msg: "token refreshed" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "something went wrong" })
    }
}

let userEditPassword = async (req: Request, res: Response) => {
    let { oldPassword, newPassword }: { oldPassword: string, newPassword: string } = req.body
    let user = req.user!
    try {
        if (await bcrypt.compare(oldPassword, user.password)) {
            //setting a new password
            user.password = await generateHash(newPassword)
            appDataSource.manager.save(user)
            res.json({ msg: "password updated successfuly" })
        } else throw new Error("wrong old password")
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not update password" })
    }
}

export {
    loginUser,
    logoutUser,
    refreshAccessToken,
    register_user,
    userEditPassword
}
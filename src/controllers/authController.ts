import {  createUser, fetchUser, fetchUserByEmail, fetchUserByusrn } from "../middleware/user.middleware";
import {  authToken, createToken, deleteToken, generateToken } from "../utilities/token";
import { generateHash } from "../utilities/hash";
import appDataSource from "../ormconfig"
import { Request, Response } from "express";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import sendResetPasswordEmail from "../utilities/resetEmail";
import User from "../entities/user";



let register_user = async (req: Request, res: Response) => {
    try {
        let { username, password, email }: { username: string, password: string, email: string } = req.body
        if (password.length < 6) throw new Error("password short")
        //creating new user
        let newUser = await createUser(username, password, email)
        if (!(newUser instanceof User)) {
            res.json({ errors: newUser })
        } else {
            //send confirmation email
            let email_confirmation_token = await generateToken({ id: (newUser as User).id }, process.env.EMAIL_TOKEN_SECRET!, '1h')
            const link = `${process.env.BASE_URL}/user/confirmation/${email_confirmation_token}`
            //sendConfirmationEmail(email, username, link)
            //response 
            res.json({ msg: "Please click on the link we have sent you via email to confirm your email><" })    
        }
    } catch (error) {
        const str: string = error.message
        if (str.startsWith("ER_DUP_ENTRY")) {
            res.json({ errors: [{ field: "email", errors: ["The email you entered is already registered. Please use a different email address."
        ] }] })
        } else if (str == "password short") {
            res.json({ errors: [{ field: "password", errors: ["password too short!"] }] })
        } else {
            res.json({ msg: "could not add a user" })
        }
        
    }

}

let confirmEmailGet = async (req: Request, res: Response) => {
    try {
        let token = req.params.token
        let { id }: { id: string }= jwt.verify(token, process.env.EMAIL_TOKEN_SECRET!) as { id: string }
        let user = await fetchUser(id)
        if (!user) throw new Error("Unvalid token!")
        user.email_confirmed = true
        appDataSource.manager.save(user)
        res.json({ msg: "email confirmed" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "failed to confirm token:(" })
    }
}

let loginUser = async (req: Request, res: Response) => {
    try {
        let { username, password } = req.body
        let userByUsername = await fetchUserByusrn(username)
        if (!userByUsername) throw new Error("uncorrect username or password!")
        if (await bcrypt.compare(password, userByUsername!.password)) {
            //check if email confirmed
            if (!userByUsername.email_confirmed) throw new Error("Please confirm your email")
            //creating access&refresh token
            let refresh = await generateToken({ id: userByUsername!.id }, process.env.REFRESH_TOKEN_SECRET!, '7d')
            let accessToken = await generateToken({ id: userByUsername!.id }, process.env.ACCESS_TOKEN_SECRET!, '1d')
            await createToken(refresh, userByUsername!)
            //response
            res.cookie('jwt', refresh, { httpOnly: true }).json({ accessToken })
        } else throw new Error("uncorrect username or password!")
    } catch (error) {
        console.log(error)
        res.json({ msg: error.message })
    }
}

let logoutUser = async (req: Request, res: Response) => {
    try {
        let refreshToken = req.cookies.jwt
        if (!refreshToken) throw new Error("something went wrong")
        let user = await fetchUser(req.user!.id, { tokens: true })
        if ((user?.tokens.some((token) => token == refreshToken))) throw new Error("something went wrong") 
        //deleting token from db
        await deleteToken(refreshToken)
        res.clearCookie('jwt').json({ msg: "logged out successfuly" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "something went wrong" })
    }

}

let refreshAccessToken = async (req: Request, res: Response) => {
    try {
        let user = req.user!
        //refreshing token
        let data = { id: user.id }
        let newAccessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1d' })
        let newRefreshToken = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' })
        await createToken(newRefreshToken, user)
        res.cookie("jwt", newRefreshToken).json({ newAccessToken, msg: "token refreshed" })
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
            await appDataSource.manager.save(user)
            res.json({ msg: "password updated successfuly" })
        } else throw new Error("wrong old password")
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not update password" })
    }
}

let forgotPassword = async (req: Request, res: Response) => {
    try {
        let { email }: { email: string } = req.body
        if (!email) throw new Error("something went wrong")
        let user = await fetchUserByEmail(email)
        if (!user) throw new Error("there is no user with this email")
        let token = await generateToken({ id: user.id }, process.env.RESET_TOKEN_SECRET!, '5m')
        user.resetToken = token
        appDataSource.manager.save(user)
        let link = `${process.env.BASE_URL}/user/password-reset/${user.id}/${token}`
        await sendResetPasswordEmail(email, user.username, link)
        res.json({ msg: "check your email inbox!" })
    } catch (error) {
        console.log(error);
        res.json({ msg: error.message })
    }
}

let resetPasswordGet = async (req: Request, res: Response) => {
    try {
        let token = req.params.token
        let user = await authToken(token, process.env.RESET_TOKEN_SECRET!)
        if (!user || user.id !== req.params.userId || user.resetToken !== token) throw new Error("invalid link or expired")
        res.json({ msg: "all good" })
    } catch (error) {
        console.log(error)
        res.json({ msg: error.message })
    }
}

let resetPasswordPost = async (req: Request, res: Response) => {
    try {
        let { password }: { password: string } = req.body
        let token = req.params.token
        let user = await authToken(token, process.env.RESET_TOKEN_SECRET!)
        if (!user || user.id !== req.params.userId || user.resetToken !== token) throw new Error("invalid link or expired")
        user.password = await generateHash(password)
        user.resetToken = '';
        appDataSource.manager.save(user)
        res.json({msg: "password reset successfuly"})
    } catch (error) {
        console.log(error)
        res.json(error.message)
    }
}



export {
    loginUser,
    logoutUser,
    refreshAccessToken,
    register_user,
    userEditPassword,
    forgotPassword,
    resetPasswordPost,
    resetPasswordGet,
    confirmEmailGet
}
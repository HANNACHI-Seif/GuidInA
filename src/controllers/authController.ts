import {  createUser, fetchUser, fetchUserByEmail, fetchUserByusrn, sanitizeUser } from "../middleware/user.middleware";
import {  authToken, createToken, deleteToken, generateToken } from "../utilities/token";
import { generateHash } from "../utilities/hash";
import appDataSource from "../ormconfig"
import { Request, Response } from "express";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import sendResetPasswordEmail from "../utilities/resetEmail";
import User from "../entities/user";
import errors from "../constants/errors";
import sendConfirmationEmail from "../utilities/confirmation_email";



let register_user = async (req: Request, res: Response) => {
    try {
        let { username, password, email }: { username: string, password: string, email: string } = req.body
        if (password.length < 6) throw new Error(errors.SHORT_PASSWORD)
        let userByUsername = await fetchUserByusrn(username)
        if (userByUsername) throw new Error(errors.USERNAME_ALREADY_IN_USE) 
        //creating new user
        let newUser = await createUser(username, password, email)
        if (!(newUser instanceof User)) {
            res.json({ errors: newUser })
        } else {
            let id = (newUser as User).id
            //send confirmation email
            let email_confirmation_token = await generateToken({ id: id }, process.env.EMAIL_TOKEN_SECRET!, '1h')
            const link = `${process.env.BASE_URL}/user/confirmation/${email_confirmation_token}`
            //tokens only for testing:
            //let refresh = await generateToken({ id: id }, process.env.REFRESH_TOKEN_SECRET!, '7d')
            //let accessToken = await generateToken({ id: id }, process.env.ACCESS_TOKEN_SECRET!, '1d')
            //await createToken(refresh, (newUser as User))
            sendConfirmationEmail(email, username, link)
            //response 
            res.json({ msg: "Please click on the link we have sent you via email to confirm your email" })  
            //res.cookie('jwt', refresh).json({ accessToken })  
        }
    } catch (error) {
        const str: string = error.message
        if (str.startsWith("ER_DUP_ENTRY")) {
            res.json({ errors: [{ field: "email", errors: [errors.EMAIL_ALREADY_REGISTERED] }] })
        } else if (str == errors.SHORT_PASSWORD) {
            res.json({ errors: [{ field: "password", errors: [errors.SHORT_PASSWORD] }] })
        } else if (error.message == errors.USERNAME_ALREADY_IN_USE){
            res.json({ errors: [ { field: "username", errors: [errors.USERNAME_ALREADY_IN_USE] } ] })
        } else {
            //res.json({ error: errors.INTERNAL_SERVER_ERROR })
            console.log(error)
            res.json({ errors: [ { field: "none", errors: [errors.INTERNAL_SERVER_ERROR] } ] })
        }
        
    }

}

let confirmEmailGet = async (req: Request, res: Response) => {
    try {
        let token = req.params.token
        let { id }: { id: string }= jwt.verify(token, process.env.EMAIL_TOKEN_SECRET!) as { id: string }
        let user = await fetchUser(id)
        if (!user) throw new Error(errors.INVALID_TOKEN)
        user.email_confirmed = true
        appDataSource.manager.save(user)
        res.json({ msg: "email confirmed" })
    } catch (error) {
        res.json({ error: error.message })
    }
}

let loginUser = async (req: Request, res: Response) => {
    try {
        let { username, password } = req.body
        let userByUsername = await fetchUserByusrn(username)
        if (!userByUsername) throw new Error(errors.WRONG_CREDENTIALS)
        if (await bcrypt.compare(password, userByUsername!.password)) {
            //check if email confirmed
            if (!userByUsername.email_confirmed) throw new Error(errors.EMAIL_NOT_CONFIRMED)
            //creating access&refresh token
            let refresh = await generateToken({ id: userByUsername!.id }, process.env.REFRESH_TOKEN_SECRET!, '7d')
            let accessToken = await generateToken({ id: userByUsername!.id }, process.env.ACCESS_TOKEN_SECRET!, '1d')
            await createToken(refresh, userByUsername!)
            //response
            let res_user = await sanitizeUser(userByUsername)
            res.cookie('jwt', refresh).json({ accessToken, user: res_user })
        } else throw new Error(errors.WRONG_CREDENTIALS)
    } catch (error) {
        res.json({ error: error.message })
    }
}

let logoutUser = async (req: Request, res: Response) => {
    try {
        let refreshToken: string = req.cookies.jwt
        if (!refreshToken) throw new Error(errors.BAD_REQUEST_REFRESH_TOKEN_MISSING)
        let user = await fetchUser(req.user!.id, { tokens: true })
        if ((user?.tokens.some((token) => token.token == refreshToken))) throw new Error(errors.UNAUTHORIZED_INVALID_TOKEN) 
        //deleting token from db
        await deleteToken(refreshToken)
        res.clearCookie('jwt').json({ msg: "logged out successfuly" })
    } catch (error) {
        res.json({ error: error.message })
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


let forgotPassword = async (req: Request, res: Response) => {
    try {
        let { email }: { email: string } = req.body
        if (!email) throw new Error(errors.EMAIL_NOT_PROVIDED)
        let user = await fetchUserByEmail(email)
        if (!user) throw new Error(errors.USER_NOT_FOUND_WITH_EMAIL)
        let token = await generateToken({ id: user.id }, process.env.RESET_TOKEN_SECRET!, '5m')
        user.resetToken = token
        appDataSource.manager.save(user)
        let link = `${process.env.BASE_URL}/user/password-reset/${user.id}/${token}`
        await sendResetPasswordEmail(email, user.username, link)
        res.json({ msg: "check your email inbox!" })
    } catch (error) {
        res.json({ msg: error.message })
    }
}

let resetPasswordGet = async (req: Request, res: Response) => {
    try {
        let token = req.params.token
        let user = await authToken(token, process.env.RESET_TOKEN_SECRET!)
        if (!user || user.id !== req.params.userId || user.resetToken !== token) throw new Error(errors.UNAUTHORIZED_INVALID_TOKEN)
        res.json({ msg: "Please insert a new password" })
    } catch (error) {
        res.json({ msg: error.message })
    }
}

let resetPasswordPost = async (req: Request, res: Response) => {
    try {
        let { password }: { password: string } = req.body
        let token = req.params.token
        let user = await authToken(token, process.env.RESET_TOKEN_SECRET!)
        if (!user || user.id !== req.params.userId || user.resetToken !== token) throw new Error(errors.UNAUTHORIZED_INVALID_TOKEN)
        if (password.length < 6) throw new Error(errors.SHORT_PASSWORD)
        user.password = await generateHash(password)
        user.resetToken = '';
        appDataSource.manager.save(user)
        res.json({msg: "password reset successfuly"})
    } catch (error) {
        res.json(error.message)
    }
}



export {
    loginUser,
    logoutUser,
    refreshAccessToken,
    register_user,
    forgotPassword,
    resetPasswordPost,
    resetPasswordGet,
    confirmEmailGet
}
import { Request, Response } from "express"
import bcrypt from 'bcrypt'
import { generateHash } from "../utilities/hash"
import appDataSource from '../ormconfig'
import errors from "../constants/errors"
import { fetchUserByusrn, fetchUserRolesMiddleware, spUserEditProfileMiddleware } from "../middleware/user.middleware"
import Special_User_Profile from "../entities/special_user_profile"
import { fetchProfile } from "../middleware/carPost.middleware"

let touristEditUsername = async (req: Request, res: Response) => {
    try {
        let { username } = req.body
        let userByUsername = await fetchUserByusrn(username)
        if (userByUsername) throw new Error(errors.USERNAME_ALREADY_IN_USE)
        let user = req.user!
        user.username = username
        await appDataSource.manager.save(user)
        res.json({ msg: "username updated" })
    } catch (error) {
        console.log(error.message)
        res.json({ error: error.message })
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
        } else throw new Error(errors.WRONG_OLD_PASSEORD)
    } catch (error) {
        res.json({ error: error.message })
    }
}

let spUserEditProfile = async (req :Request, res: Response) => {
    try {
        let user_profile = await appDataSource.getRepository(Special_User_Profile)
        .createQueryBuilder('special_user_profile')
            .where('special_user_profile.userId = :id', { id: req.params.id })
                .getOne()
        if (!user_profile) throw new Error(errors.FORBIDDEN)
        let { firstName, lastName, bio  } = req.body
        await spUserEditProfileMiddleware(firstName, lastName, bio, user_profile)
        res.json({ msg: "profile edited" })
    } catch (error) {
        console.log(error.message)
        res.json({ error: error.message })
    }
}

let userUploadpfp = async (req: Request, res: Response) => {
    try {
        let user = req.user
        user!.pfp_url! = req.file?.path!
        await appDataSource.manager.save(user)
        res.json({ msg :"profile picture updated successfuly" })
    } catch (error) {
        res.json({ error: errors.INTERNAL_SERVER_ERROR })
    }
}
 
let fetchSPUSerProfile = async (req: Request, res: Response) => {
    try {
        let profile = await fetchProfile(req.params.id)
        res.json({ profile })
    } catch (error) {
        console.log(error)
        res.json({ error: errors.INTERNAL_SERVER_ERROR })
    }
}

let fetchUserRoles = (req: Request, res: Response) => {
    try {
        let roles = fetchUserRolesMiddleware(req.params.id)
        res.json({ roles })
    } catch (error) {
        console.log(error)
        res.json({ error: errors.INTERNAL_SERVER_ERROR })
    }
}


export {
    touristEditUsername,
    userEditPassword,
    spUserEditProfile,
    userUploadpfp,
    fetchSPUSerProfile,
    fetchUserRoles
}
import appDataSource from "../ormconfig"
import { AdminEditUser, createUser, deleteUser, fetchUser } from "../middleware/user.middleware";
import User from "../entities/user";
import { Request, Response } from "express";



let adminAddUser = async (req: Request, res: Response) => {
    try {
        let { user, username, password, email, isAdmin }: { user: User, username: string, password: string, email: string, isAdmin: boolean } = req.body
        if (!user.isAdmin) throw new Error("Unauthorized")
        //add user
        let newUser = await createUser(username, password, email, isAdmin)
        appDataSource.manager.save(newUser)
        res.json({ msg: "user created" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not create user" })
    }
}

let adminDeleteUser = (req: Request, res: Response) => {
    try {
        let { user }: { user: User, userToDeleteId: string } = req.body
        if (!user.isAdmin) throw new Error("Unauthorized")
        deleteUser(req.params.id)
        res.json({ msg: "user deleted successfuly" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not delete user" })
    }
}


let adminEditUser = async (req: Request, res: Response) => {
    try {
        let { user, newUsername, newPassword, newEmail, isAdmin  }: { user: User, newUsername: string, newPassword: string, newEmail: string, isAdmin: boolean } = req.body
        if (user.isAdmin) {
            //edit
            let userToEdit = await fetchUser(req.params.id)
            if (!userToEdit) throw new Error("user not found")
            AdminEditUser(userToEdit, newUsername, newPassword, newEmail, isAdmin)
            res.json({ msg: "user edited successfully" })
        } else throw new Error("unauthorized")
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not edit user" })
    }
}

export {
    adminAddUser,
    adminDeleteUser,
    adminEditUser
}
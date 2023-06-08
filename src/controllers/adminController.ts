import appDataSource from "../ormconfig"
import { AdminEditUser, createUser, deleteUser, fetchUser } from "../middleware/user.middleware";
import { Request, Response } from "express";
import roles from "../constants/roles";
import User from "../entities/user";
import errors from "../constants/errors";



let adminAddUser = async (req: Request, res: Response) => {
    try {
        let { username, password, email, role }: { username: string, password: string, email: string, role: roles[] } = req.body
        let isAdmin = req.user?.roles.some(role => role.roleName == roles.ADMIN)
        if (!isAdmin) throw new Error("Unauthorized")
        //add user
        let newUser = await createUser(username, password, email, role)
        await appDataSource.manager.save(newUser)
        res.json({ msg: "user created" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not create user" })
    }
}

let adminDeleteUser = async (req: Request, res: Response) => {
    try {
        let isAdmin = req.user?.roles.some(role => role.roleName == roles.ADMIN)
        if (!isAdmin) throw new Error("Unauthorized")
        await deleteUser(req.params.id)
        res.json({ msg: "user deleted successfuly" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not delete user" })
    }
}


let adminEditUser = async (req: Request, res: Response) => {
    try {
        let { newUsername, newPassword, newEmail, newRole  }: { newUsername: string, newPassword: string, newEmail: string, newRole: roles[] } = req.body
        let isAdmin = req.user?.roles.some(role => role.roleName == roles.ADMIN)
        if (!isAdmin) throw new Error("unauthorized")
        //edit
        let userToEdit = await fetchUser(req.params.id)
        if (!userToEdit) throw new Error("user not found")
        await AdminEditUser(userToEdit, newUsername, newPassword, newEmail, newRole)
        res.json({ msg: "user edited successfully" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not edit user" })
    }
}

let adminFetchAllUsers = async (req: Request, res: Response) => {
    try {
        let users = await appDataSource.getRepository(User)
            .find()
        res.json({ users })
    } catch (error) {
        console.log(error)
        res.json({ error: errors.INTERNAL_SERVER_ERROR })
    }
}

export {
    adminAddUser,
    adminDeleteUser,
    adminEditUser,
    adminFetchAllUsers
}
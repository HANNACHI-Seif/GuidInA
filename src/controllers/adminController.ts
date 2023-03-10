import appDataSource from "../ormconfig"
import { AdminEditUser, createUser, deleteUser, fetchUser } from "../middleware/user.middleware";
import { Request, Response } from "express";
import roles from "../constants/roles";



let adminAddUser = async (req: Request, res: Response) => {
    try {
        let { username, password, email, role }: { username: string, password: string, email: string, role: string } = req.body
        let user = req.user!
        if (user.role !== roles.ADMIN) throw new Error("Unauthorized")
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
        let user = req.user!
        if (user.role !== roles.ADMIN) throw new Error("Unauthorized")
        await deleteUser(req.params.id)
        res.json({ msg: "user deleted successfuly" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not delete user" })
    }
}


let adminEditUser = async (req: Request, res: Response) => {
    try {
        let { newUsername, newPassword, newEmail, newRole  }: { newUsername: string, newPassword: string, newEmail: string, newRole: string } = req.body
        let user = req.user!
        if (user.role !== roles.ADMIN) throw new Error("unauthorized")
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

export {
    adminAddUser,
    adminDeleteUser,
    adminEditUser
}
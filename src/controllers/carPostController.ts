import { Request, Response } from "express";
import carSeats from "../constants/carSeats";
import { createCarPostMiddleware, deleteCarpostMiddleware, editCarPostMiddleware, fetchCarPost, fetchProfile } from "../middleware/carPost.middleware";
import errors from "../constants/errors";
import roles from "../constants/roles";
import appDataSource from '../ormconfig'
import Car_Post from "../entities/car_post";

let createCarPost = async (req: Request, res: Response) => {
    try {
        let user = req.user!
        let isCarRenter = user.roles.some((role) => role.roleName == roles.CAR_RENTER)
        if (!isCarRenter) throw new Error(errors.UNAUTHORIZED_CAR_RENTERS_ONLY)
        let images = req.files
        let { description, seats, price, car_name }: { description: string, seats: string, price: number, car_name: string } = req.body
        let newPost = await createCarPostMiddleware( (images as Express.Multer.File[]), description, (seats as carSeats), price, car_name, user)
        res.json({ newPost })
    } catch (error) {
        console.log(error.message)
        res.json({ error: error.message })
    }
}

let changeCarState = async (req: Request, res: Response) => {
    try {
        let user = req.user!
        let isCarRenter = user.roles.some((role) => role.roleName == roles.CAR_RENTER)
        if (!isCarRenter) throw new Error(errors.UNAUTHORIZED_CAR_RENTERS_ONLY)
        let carPost = await fetchCarPost(req.params.id)
        if (!carPost) throw new Error(errors.RESOURCE_NOT_FOUND)
        if (carPost.isAvailable) carPost.isAvailable = false
        else carPost.isAvailable = true
        await appDataSource.manager.save(carPost)
        res.json({ msg: "state changed" })
    } catch (error) {
        console.log(error.message)
        res.json({ error: error.message })
    }
}


let deleteCarPost = async (req: Request, res: Response) => {
    try {
        let user = req.user!
        let isCarRenter = user.roles.some((role) => role.roleName == roles.CAR_RENTER)
        let isAdmin = user.roles.some((role) => role.roleName == roles.ADMIN)
        if (!isCarRenter && !isAdmin) throw new Error(errors.UNAUTHORIZED_CAR_RENTERS_ONLY)
        let profile = await fetchProfile(user.id!)
        if (!profile) {
            return res.json({ error: errors.UNAUTHORIZED_CAR_RENTERS_ONLY })
        } 
        let postToDelete = await appDataSource
        .getRepository(Car_Post)
            .createQueryBuilder('car_post')
                .leftJoinAndSelect('car_post.images', 'car_image')
                    .where('car_post.profileId =:id', { id: profile!.id })
                        .andWhere('car_post.id =:postId', { postId: req.params.id })
                            .getOne()
        if (!postToDelete) throw new Error(errors.RESOURCE_NOT_FOUND)
        await deleteCarpostMiddleware(postToDelete)
        return res.json({ msg: "post deleted" })
    } catch (error) {
        console.log(error)
        return res.json({ error: error.message })
    }
}


let editCarPost = async (req: Request, res: Response) => {
    try {
        let user = req.user!
        let isCarRenter = user.roles.some((role) => role.roleName == roles.CAR_RENTER)
        if (!isCarRenter) throw new Error(errors.UNAUTHORIZED_CAR_RENTERS_ONLY)
        let { description, car_name, seats, price }: { description: string, car_name: string, seats: string, price: number } = req.body
        let carPostToEdit = await fetchCarPost(req.params.id)
        if (!carPostToEdit) throw new Error(errors.RESOURCE_NOT_FOUND)
        await editCarPostMiddleware(carPostToEdit, description, car_name, (seats as carSeats), price)
        res.json({ msg: "post edited successfully" })
    } catch (error) {
        console.log(error.message)
        res.json({ error: error.message })
    }
}

export {
    createCarPost,
    deleteCarPost,
    editCarPost,
    changeCarState
}
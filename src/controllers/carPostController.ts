import { Request, Response } from "express";
import carSeats from "../constants/carSeats";
import { createCarPostMiddleware, deleteCarpostMiddleware, fetchCarPost, fetchProfile } from "../middleware/carPost.middleware";
import errors from "../constants/errors";
import roles from "../constants/roles";
import appDataSource from '../ormconfig'
import Car_Post from "../entities/car_post";

let createCarPost = async (req: Request, res: Response) => {
    try {
        let user = req.user!
        let isCarRenter = user.roles.some((role) => role.roleName == roles.CAR_RENTER)
        if (!isCarRenter) throw new Error(errors.UNAUTHORIZED_CAR_RENTERS_ONLY)
        let { description, seats, price, car_name }: { description: string, seats: string, price: number, car_name: string } = req.body
        let newPost = await createCarPostMiddleware(description, (seats as carSeats), price, car_name, user)
        res.json({ newPost })
    } catch (error) {
        console.log(error.message)
        res.json({ error: error.message })
    }
}

let uploadCarImage = (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        
    }
}


let deleteCarPost = async (req: Request, res: Response) => {
    try {
        let profile = await fetchProfile(req.user?.id!)
        if (!profile) {
            return res.json({ error: errors.UNAUTHORIZED_CAR_RENTERS_ONLY })
        } 
        let postToDelete = await appDataSource
        .getRepository(Car_Post)
            .createQueryBuilder('car_post')
                .where('car_post.profileId =:id', { id: profile!.id })
                    .andWhere('car_post.id =:postId', { postId: req.params.id })
                        .getOne()
        if (!postToDelete) throw new Error(errors.RESOURCE_NOT_FOUND)
        await deleteCarpostMiddleware(postToDelete.id)
        return res.json({ msg: "post deleted" })
    } catch (error) {
        console.log(error)
        return res.json({ error: error.message })
    }
}


let editCarPost = (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        
    }
}

export {
    createCarPost,
    uploadCarImage,
    deleteCarPost,
    editCarPost
}
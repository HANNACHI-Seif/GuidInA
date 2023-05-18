import { Request, Response } from "express";
import errors from "../constants/errors";
import roles from "../constants/roles";
import propertyType from "../constants/propertyType";
import houseRentPeriod from "../constants/houseRentPeriod";
import { createHousePostMiddle, editHousePostMiddleware, fetchHousePost, deleteHousePostMiddleware } from "../middleware/housePost.middleware";
import appDataSource from '../ormconfig'
import { fetchProfile } from "../middleware/carPost.middleware";
import House_Post from "../entities/house_post";

let createHousePost = async (req: Request, res: Response) => {
    try {
        let user = req.user!
        let isHouseRenter = user.roles.some((role) => role.roleName == roles.HOUSE_RENTER)
        if (!isHouseRenter) throw new Error(errors.UNAUTHORIZED_HOUSE_RENTERS_ONLY)
        let images = req.files
        let { description, property_type, rent_by, price }: {
            description: string, property_type: propertyType, rent_by: houseRentPeriod, price: number
        } = req.body
        let newPost = await createHousePostMiddle((images as Express.Multer.File[]), description, (property_type as propertyType), (rent_by as houseRentPeriod), price, user)
        res.json({ newPost })
    } catch (error) {
        console.log(error.message)
        res.json({ error: error.message })
    }
}


let changeHouseState = async (req: Request, res: Response) => {
    try {
        let user = req.user!
        let isHouseRenter = user.roles.some((role) => role.roleName == roles.HOUSE_RENTER)
        if (!isHouseRenter) throw new Error(errors.UNAUTHORIZED_HOUSE_RENTERS_ONLY)
        let housePost = await fetchHousePost(req.params.id)
        if (!housePost) throw new Error(errors.RESOURCE_NOT_FOUND)
        if (housePost.isAvailable) housePost.isAvailable = false
        else housePost.isAvailable = true
        await appDataSource.manager.save(housePost)
        res.json({ msg: "state chnaged" })
    } catch (error) {
        console.log(error.message)
        res.json({ error: error.message })
    }
}


let deleteHousePost = async (req: Request, res: Response) => { 
    try {
        let user = req.user!
        let isHouseRenter = user.roles.some((role) => role.roleName == roles.HOUSE_RENTER)
        let isAdmin = user.roles.some((role) => role.roleName == roles.ADMIN)
        if (!isHouseRenter && !isAdmin) throw new Error(errors.UNAUTHORIZED_HOUSE_RENTERS_ONLY)
        let profile = await fetchProfile(user.id)
        if (!profile) {
            return res.json({ error: errors.UNAUTHORIZED_HOUSE_RENTERS_ONLY })
        }
        let postToDelete = await appDataSource
        .getRepository(House_Post)
            .createQueryBuilder('car_post')
                .leftJoinAndSelect('house_post.images', 'car_image')
                    .where('house_post.profileId =:id', { id: profile!.id })
                        .andWhere('house_post.id =:postId', { postId: req.params.id })
                            .getOne()
        if (!postToDelete) throw new Error(errors.RESOURCE_NOT_FOUND)
        await deleteHousePostMiddleware(postToDelete)
        return res.json({ msg: "post deleted" })
    } catch (error) {
        console.log(error.message)
        return res.json({ error: error.message })
    }
} 


let editHousePost = async (req: Request, res: Response) => {
    try {
        let user = req.user!
        let isCarRenter = user.roles.some((role) => role.roleName == roles.CAR_RENTER)
        if (!isCarRenter) throw new Error(errors.UNAUTHORIZED_CAR_RENTERS_ONLY)
        let housePostToEdit = await fetchHousePost(req.params.id)
        if (!housePostToEdit) throw new Error(errors.RESOURCE_NOT_FOUND)
        let { description, property_type, rent_by, price }: {
            description: string, property_type: propertyType, rent_by: houseRentPeriod, price: number
        } = req.body
        await editHousePostMiddleware(housePostToEdit, description, (property_type as propertyType), (rent_by as houseRentPeriod), price)
        res.json({ msg: "post edited successfuly" })
    } catch (error) {
        console.log(error.message)
        res.json({ error: error.message })
    }
}


export {
    createHousePost,
    deleteHousePost,
    editHousePost,
    changeHouseState
}
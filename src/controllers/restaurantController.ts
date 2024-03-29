import { Request, Response } from "express";
import { addRestaurantImageMiddleware, addRestaurantMiddleware, deleteRestaurantImageMiddleware, editRestaurantmiddleware, fetchRestaurant, fetchRestaurantImage } from "../middleware/restaurant.middleware";
import appDataSource from '../ormconfig'
import Restaurant from "../entities/restaurant";
import errors from "../constants/errors";


let addRestaurant = async (req: Request, res: Response) => {
    try {
        let { name, description, city, type, maps_link }: { name: string, description: string, city: string, type: string, maps_link: string } = req.body
        await addRestaurantMiddleware(city, name, description, type, maps_link)
        res.json({ msg: "restaurant added" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not add restaurant" })
    }
}

let addRestaurantImage = async (req: Request, res: Response) => {
    try {
        let restaurant = await fetchRestaurant(req.params.id)
        if ( !restaurant ) throw new Error("something went wrong")
        await addRestaurantImageMiddleware(req.file?.path!, restaurant)
        res.json({ msg: "image added" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not add image" })
    }
}

let deleteRestaurantImage = async (req: Request, res: Response) => {
    try {
        let restaurant = await fetchRestaurant(req.params.restaurantId, { images: true })
        let image = await fetchRestaurantImage(req.params.imageId)
        if ( !restaurant || !image || !(restaurant.images.some((restaurantImage) => restaurantImage.id == image?.id))) throw new Error("something went wrong")
        //deleting
        await deleteRestaurantImageMiddleware(image)
        res.json({ msg: "image deleted" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "something went wrong" })
    }
}

let deleteRestaurant = async (req: Request, res: Response) => {
    try {
        let restaurantToDelete = await fetchRestaurant(req.params.id, { images: true })
        if (!restaurantToDelete) throw new Error("something went wrong")
        await restaurantToDelete.images.forEach(async (image) => await deleteRestaurantImageMiddleware(image))
        await appDataSource.manager.remove(restaurantToDelete)
        res.json({ msg: "restaurant deleted successfuly" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not delete restaurant" })
    }
}

let editRestaurant = async (req: Request, res: Response) => {
    try {
        let restaurantToEdit = await fetchRestaurant(req.params.id)
        if ( !restaurantToEdit ) throw new Error("something went wrong")
        let { newname, newcity, newDescription, newType, new_maps_link }: { newname: string, newcity: string, newDescription: string, newType: string, new_maps_link: string } = req.body
        await editRestaurantmiddleware(restaurantToEdit, newname, newcity, newDescription, newType, new_maps_link)
        res.json({ msg: "restaurant edited" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not edit restaurant" })
    }
}

let fetchRestaurantController = async (req: Request, res: Response) => {
    try {
        let restaurants = await appDataSource.getRepository(Restaurant).find({ take: 6, order: { rating: "DESC" } })
        res.json({ restaurants })
    } catch (error) {
        console.log(error)
        res.json({ msg: errors.INTERNAL_SERVER_ERROR })
    }
}

export {
    addRestaurant,
    addRestaurantImage,
    deleteRestaurantImage,
    deleteRestaurant,
    editRestaurant,
    fetchRestaurantController
}
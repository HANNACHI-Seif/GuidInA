import { Request, Response } from "express";
import { addRestaurantImageMiddleware, addRestaurantMiddleware, deleteRestaurantImageMiddleware, editRestaurantmiddleware, fetchRestaurant, fetchRestaurantImage } from "../middleware/restaurant.middleware";
import appDataSource from '../ormconfig'


let addRestaurant = async (req: Request, res: Response) => {
    try {
        let { name, description, city, type }: { name: string, description: string, city: string, type: string } = req.body
        await addRestaurantMiddleware(city, name, description, type)
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
        let { newname, newcity, newDescription, newType }: { newname: string, newcity: string, newDescription: string, newType: string } = req.body
        await editRestaurantmiddleware(restaurantToEdit, newname, newcity, newDescription, newType)
        res.json({ msg: "restaurant edited" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not edit restaurant" })
    }
}

export {
    addRestaurant,
    addRestaurantImage,
    deleteRestaurantImage,
    deleteRestaurant,
    editRestaurant
}
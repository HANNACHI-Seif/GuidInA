import { Request, Response } from "express";
import appDataSource from "../ormconfig"
import Destination from "../entities/destination";
import { Like } from "typeorm";
import Hotel from "../entities/hotel";
import Restaurant from "../entities/restaurant";
import errors from "../constants/errors";
import User from "../entities/user";

let searchDHR = async (req: Request, res: Response) => {//stands for destination hotel restaurant
    try {
        let query: string = req.params.q
        let { city }: { city: string } = req.body
        let destinations = await appDataSource.getRepository(Destination).find({ where: { name: Like(`%${query}%`), city: city } })
        let hotels = await appDataSource.getRepository(Hotel).find({ where: { name: Like(`%${query}%`) } })
        let restaurant = await appDataSource.getRepository(Restaurant).find({ where:  { name: Like(`%${query}%`) } })
        res.json({ destinations, hotels, restaurant })
    } catch (error) {
        res.json({ error: errors.INTERNAL_SERVER_ERROR })
    }
}

let adminSearchForUsers = async (req: Request, res: Response) => {
    try {
        let query = req.params.q
        let usersByUsername = await appDataSource.getRepository(User)
            .find({ 
                where: { username: Like(`%${query}%`) },
                relations: { roles: true },
                select: {
                    id: true,
                    username: true,
                    email: true
                }
            })
        let usersByEmail = await appDataSource.getRepository(User)
            .find({ 
                where: { email: Like(`%${query}%`) },
                relations: { roles: true },
                select:{
                    id: true,
                    username: true,
                    email: true
                }
            })
        const users = usersByEmail.concat(usersByUsername).filter((obj, index, self) => 
        index === self.findIndex((o) => o.id === obj.id)
        );
        res.json({ users: users })
    } catch (error) {
        console.log(error)
        res.json({ error: errors.INTERNAL_SERVER_ERROR })
    }
}

let adminSearchDestinations = async (req: Request, res: Response) => {
    try {
        let query = req.params.q
        let destinationsByName = await appDataSource.getRepository(Destination)
            .find({
                where: { name: Like(`%${query}%`) },
                select: {
                    id: true,
                    name: true,
                    city: true,
                    description: true
                }
            })
        let destinationsByCity = await appDataSource.getRepository(Destination)
            .find({
                where: { city: Like(`%${query}%`) },
                select: {
                    id: true,
                    name: true,
                    city: true,
                    description: true
                }
            })
        const destinations = destinationsByCity.concat(destinationsByName).filter((obj, index, self) => 
            index === self.findIndex((o) => o.id === obj.id)
        );
        res.json({ destinations })
    } catch (error) {
        console.log(error)
        res.json({ error: errors.INTERNAL_SERVER_ERROR })
    }
}

let adminSearchHotels = async (req: Request, res: Response) => {
    try {
        let query = req.params.q
        let hotelsByName = await appDataSource.getRepository(Hotel)
            .find({
                where: { name: Like(`%${query}%`) },
                select: {
                    id: true,
                    name: true,
                    city: true,
                    description: true,
                    stars: true
                }
            })
        let hotelsByCity = await appDataSource.getRepository(Hotel)
            .find({
                where: { city: Like(`%${query}%`) },
                select: {
                    id: true,
                    name: true,
                    city: true,
                    description: true,
                    stars: true
                }
            })
        const hotels = hotelsByCity.concat(hotelsByName).filter((obj, index, self) => 
            index === self.findIndex((o) => o.id === obj.id)
        );
        res.json({ hotels })
    } catch (error) {
        console.log(error)
        res.json({ error: errors.INTERNAL_SERVER_ERROR })
    }
}

let adminSearchRestaurants = async (req: Request, res: Response) => {
    try {
        let query = req.params.q
        let restaurantsByName = await appDataSource.getRepository(Restaurant)
            .find({
                where: { name: Like(`%${query}%`) },
                select: {
                    id: true,
                    name: true,
                    city: true,
                    description: true,
                    type: true
                }
            })
        let restaurantsByCity = await appDataSource.getRepository(Restaurant)
            .find({
                where: { city: Like(`%${query}%`) },
                select: {
                    id: true,
                    name: true,
                    city: true,
                    description: true,
                    type: true
                }
            })
        const restaurants = restaurantsByCity.concat(restaurantsByName).filter((obj, index, self) => 
            index === self.findIndex((o) => o.id === obj.id)
        );
        res.json({ restaurants })
    } catch (error) {
        console.log(error)
        res.json({ error: errors.INTERNAL_SERVER_ERROR })
    }
}

export {
    searchDHR,
    adminSearchForUsers,
    adminSearchDestinations,
    adminSearchHotels,
    adminSearchRestaurants
}
import appDataSource from '../ormconfig'
import fs from 'fs'
import Restaurant from '../entities/restaurant'
import Rest_Image from '../entities/rest_image'
import Decimal from 'decimal.js'

let addRestaurantMiddleware = (city: string, name: string, description: string, type: string, maps_link: string) => {
    let newRestaurant = new Restaurant()
    newRestaurant.city = city
    newRestaurant.name = name 
    newRestaurant.description = description
    newRestaurant.type = type;
    newRestaurant.maps_link = maps_link
    newRestaurant.rating = new Decimal(0)
    appDataSource.manager.save(newRestaurant)
}

let fetchRestaurant = (restaurantId: string, obj = {}) => {
    let restaurantRepo = appDataSource.getRepository(Restaurant)
    return restaurantRepo.findOne({ where: { id: restaurantId }, relations: obj })
}

let addRestaurantImageMiddleware = (url : string, restaurant: Restaurant) => {
    let imageRestaurantRepo = appDataSource.getRepository(Rest_Image)
    let newRestaurantImage = new Rest_Image
    newRestaurantImage.url = url
    newRestaurantImage.restaurant = restaurant
    imageRestaurantRepo.save(newRestaurantImage)
}

let fetchRestaurantImage = (restaurantImageId: string) => {
    let restaurantImageRepo = appDataSource.getRepository(Rest_Image)
    return restaurantImageRepo.findOne({ where: { id: restaurantImageId } })
}

let deleteRestaurantImageMiddleware = (image: Rest_Image) => {
    appDataSource.manager.remove(image)
    if ( fs.existsSync(image.url) ) fs.unlinkSync(image.url)
}

let editRestaurantmiddleware = (restaurantToEdit: Restaurant, newname: string, newcity: string, newDescription: string, newType: string, new_maps_link: string) => {
    if (newname) restaurantToEdit.name = newname
    if (newcity) restaurantToEdit.city = newcity
    if (newDescription) restaurantToEdit.description = newDescription
    if (newType) restaurantToEdit.type = newType
    if (new_maps_link) restaurantToEdit.maps_link = new_maps_link
    appDataSource.manager.save(restaurantToEdit)
}

export {
    addRestaurantMiddleware,
    fetchRestaurant,
    addRestaurantImageMiddleware,
    fetchRestaurantImage,
    deleteRestaurantImageMiddleware,
    editRestaurantmiddleware
}
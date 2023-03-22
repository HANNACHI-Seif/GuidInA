import appDataSource from '../ormconfig'
import fs from 'fs'
import Restaurant from '../entities/restaurant'
import Restaurant_Image from '../entities/restaurant_image'

let addRestaurantMiddleware = (city: string, name: string, description: string, type: string) => {
    let newRestaurant = new Restaurant()
    newRestaurant.city = city
    newRestaurant.name = name 
    newRestaurant.description = description
    newRestaurant.type = type;
    appDataSource.manager.save(newRestaurant)
}

let fetchRestaurant = (restaurantId: string, obj = {}) => {
    let restaurantRepo = appDataSource.getRepository(Restaurant)
    return restaurantRepo.findOne({ where: { id: restaurantId }, relations: obj })
}

let addRestaurantImageMiddleware = (url : string, restaurant: Restaurant) => {
    let imageRestaurantRepo = appDataSource.getRepository(Restaurant_Image)
    let newRestaurantImage = new Restaurant_Image
    newRestaurantImage.url = url
    newRestaurantImage.restaurant = restaurant
    imageRestaurantRepo.save(newRestaurantImage)
}

let fetchRestaurantImage = (restaurantImageId: string) => {
    let restaurantImageRepo = appDataSource.getRepository(Restaurant_Image)
    return restaurantImageRepo.findOne({ where: { id: restaurantImageId } })
}

let deleteRestaurantImageMiddleware = (image: Restaurant_Image) => {
    appDataSource.manager.remove(image)
    if ( fs.existsSync(image.url) ) fs.unlinkSync(image.url)
}

let editRestaurantmiddleware = (restaurantToEdit: Restaurant, newname: string, newcity: string, newDescription: string, newType: string) => {
    if (newname) restaurantToEdit.name = newname
    if (newcity) restaurantToEdit.city = newcity
    if (newDescription) restaurantToEdit.description = newDescription
    if (newType) restaurantToEdit.type = newType
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
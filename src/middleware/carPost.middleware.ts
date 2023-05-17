import carSeats from "../constants/carSeats"
import Car_Post from "../entities/car_post"
import appDataSource from '../ormconfig'
import User from "../entities/user"
import Special_User_Profile from "../entities/special_user_profile"
import Car_Image from "../entities/car_image"




let createCarPostMiddleware = async ( images:Express.Multer.File[], description: string, seats: carSeats, price: number, car_name: string, user: User) => {
    let newCarPost = new Car_Post()
    newCarPost.description = description
    newCarPost.seats = seats
    newCarPost.price = price
    newCarPost.isAvailable = true
    newCarPost.car_name = car_name

    let user_profile = await appDataSource
    .getRepository(Special_User_Profile)
        .createQueryBuilder('special_user_profile')
            .where('special_user_profile.userId = :userId', { userId: user.id })
                    .getOne()
    newCarPost.profile = user_profile!
    let result = await appDataSource.getRepository(Car_Post).save(newCarPost)
    for (let i of images) {
        let newImage = new Car_Image()
        newImage.car_post = result
        newImage.url = i.path
        await appDataSource.manager.save(newImage)
    }
    return result
}

let fetchCarPost = async (id: string) => {
    return await appDataSource.getRepository(Car_Post).findOne({ where: { id: id } })
}

let fetchProfile = async (userID: string) => {
    return await appDataSource
    .getRepository(Special_User_Profile)
        .createQueryBuilder('special_user_profile')
            .where('special_user_profile.userId = :userId', { userId: userID })
                .getOne() 
}

let deleteCarpostMiddleware = async (carPost: Car_Post) => {
    await appDataSource.getRepository(Car_Post).remove(carPost)
}

let editCarPostMiddleware = async ( carPost: Car_Post, description: string, car_name: string, seats: carSeats, price: number) => {
    if ( description ) carPost.description = description
    if ( car_name ) carPost.car_name = car_name
    if ( seats ) carPost.seats = seats
    if ( price ) carPost.price = price
    return await appDataSource.manager.save(carPost)
}


export {
    createCarPostMiddleware,
    fetchCarPost,
    fetchProfile,
    deleteCarpostMiddleware,
    editCarPostMiddleware

}
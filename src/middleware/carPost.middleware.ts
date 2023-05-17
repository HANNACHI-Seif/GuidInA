import roles from "../constants/roles"
import carSeats from "../constants/carSeats"
import Car_Post from "../entities/car_post"
import appDataSource from '../ormconfig'
import Role from "../entities/role"
import User from "../entities/user"
import Special_User_Profile from "../entities/special_user_profile"




let createCarPostMiddleware = async (description: string, seats: carSeats, price: number, car_name: string, user: User) => {
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
    return await appDataSource.getRepository(Car_Post).save(newCarPost)
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

let deleteCarpostMiddleware = async (id: string) => {
    await appDataSource.getRepository(Car_Post).delete({ id: id })
}


export {
    createCarPostMiddleware,
    fetchCarPost,
    fetchProfile,
    deleteCarpostMiddleware

}
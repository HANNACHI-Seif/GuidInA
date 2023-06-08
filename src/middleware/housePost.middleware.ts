import User from '../entities/user'
import houseRentPeriod from '../constants/houseRentPeriod'
import propertyType from '../constants/propertyType'
import appDataSource from '../ormconfig'
import House_Post from '../entities/house_post'
import Special_User_Profile from '../entities/special_user_profile'
import House_Image from '../entities/house_image'


let createHousePostMiddle = async ( images: Express.Multer.File[], description: string, property_type: propertyType, rent_by: houseRentPeriod, price: number, user: User) => {
    let newPost = new House_Post()
    newPost.description = description
    newPost.price = price
    newPost.property_type = property_type
    newPost.rent_by = rent_by

    let user_profile = await appDataSource
    .getRepository(Special_User_Profile)
        .createQueryBuilder('special_user_profile')
            .where('special_user_profile.userId = :id', { id: user.id })
                .getOne()
    newPost.profile = user_profile!
    let result = await appDataSource.getRepository(House_Post).save(newPost)
    for (let i of images) {
        let newImage = new House_Image()
        newImage.house_post = result
        newImage.url = i.path
        await appDataSource.manager.save(newImage)
    }
    return result
}


let fetchHousePost = async (id: string) => {
    return await appDataSource.getRepository(House_Post).findOne({ where: { id: id } })
}

let deleteHousePostMiddleware = async (postToDelete: House_Post) => {
    await appDataSource.getRepository(House_Post).remove(postToDelete)
}

let editHousePostMiddleware = async (housePostToEdit: House_Post, description: string, property_type: propertyType, rent_by: houseRentPeriod, price: number) => {
    if (description) housePostToEdit.description = description
    if (property_type) housePostToEdit.property_type = property_type
    if (rent_by) housePostToEdit.rent_by = rent_by
    if (price) housePostToEdit.price = price
    return await appDataSource.manager.save(housePostToEdit)
}   



export {
    createHousePostMiddle,
    fetchHousePost,
    editHousePostMiddleware,
    deleteHousePostMiddleware
}
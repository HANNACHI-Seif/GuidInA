import Hotel from '../entities/hotel'
import appDataSource from '../ormconfig'
import fs from 'fs'
import Hotel_Image from '../entities/hotel_image'

let addHotelMiddleware = (city: string, name: string, description: string) => {
    let newDestination = new Hotel
    newDestination.city = city
    newDestination.name = name 
    newDestination.description = description
    appDataSource.manager.save(newDestination)
}

let fetchHotel = (hotelId: string, obj = {}) => {
    let destRepo = appDataSource.getRepository(Hotel)
    return destRepo.findOne({ where: { id: hotelId }, relations: obj })
}

let addHotelImageMiddleware = (url : string, hotel: Hotel) => {
    let imageHotelRepo = appDataSource.getRepository(Hotel_Image)
    let newHotelImage = new Hotel_Image()
    newHotelImage.url = url
    newHotelImage.hotel = hotel
    imageHotelRepo.save(newHotelImage)
}

let fetchHotelImage = (hotelImageId: string) => {
    let destImageRepo = appDataSource.getRepository(Hotel_Image)
    return destImageRepo.findOne({ where: { id: hotelImageId } })
}

let deleteHotelImageMiddleware = (image: Hotel_Image) => {
    appDataSource.manager.remove(image)
    if ( fs.existsSync(image.url) ) fs.unlinkSync(image.url)
}

let editHotelmiddleware = (hotelToEdit: Hotel, newname: string, newcity: string, newDescription: string) => {
    if (newname) hotelToEdit.name = newname
    if (newcity) hotelToEdit.city = newcity
    if (newDescription) hotelToEdit.description = newDescription
    appDataSource.manager.save(hotelToEdit)
}

export {
    addHotelMiddleware,
    fetchHotel,
    addHotelImageMiddleware,
    fetchHotelImage,
    deleteHotelImageMiddleware,
    editHotelmiddleware
}
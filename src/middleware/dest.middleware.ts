import Dest_Image from '../entities/dest_image'
import Destination from '../entities/destination'
import appDataSource from '../ormconfig'
import fs from 'fs'

let addDestMiddleware = (city: string, name: string, description: string, type: string) => {
    let newDestination = new Destination()
    newDestination.city = city
    newDestination.name = name 
    newDestination.description = description
    newDestination.type = type
    appDataSource.manager.save(newDestination)
}

let fetchDest = (destId: string, obj = {}) => {
    let destRepo = appDataSource.getRepository(Destination)
    return destRepo.findOne({ where: { id: destId }, relations: obj })
}

let addDestImageMiddleware = (url : string, dest: Destination) => {
    let imageDestRepo = appDataSource.getRepository(Dest_Image)
    let newDestImage = new Dest_Image()
    newDestImage.url = url
    newDestImage.destination = dest
    imageDestRepo.save(newDestImage)
}

let fetchDestImage = (destImageId: string) => {
    let destImageRepo = appDataSource.getRepository(Dest_Image)
    return destImageRepo.findOne({ where: { id: destImageId } })
}

let deleteDestImageMiddleware = (image: Dest_Image) => {
    appDataSource.manager.remove(image)
    if ( fs.existsSync(image.url) ) fs.unlinkSync(image.url)
}

let editDestmiddleware = (destToEdit: Destination, newname: string, newcity: string, newDescription: string, newType: string) => {
    if (newname) destToEdit.name = newname
    if (newcity) destToEdit.city = newcity
    if (newDescription) destToEdit.description = newDescription
    if (newType) destToEdit.type = newType
    appDataSource.manager.save(destToEdit)
}

export {
    addDestMiddleware,
    fetchDest,
    addDestImageMiddleware,
    fetchDestImage,
    deleteDestImageMiddleware,
    editDestmiddleware
}
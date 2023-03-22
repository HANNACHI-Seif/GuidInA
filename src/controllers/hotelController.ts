import { Request, Response } from "express";
import { addHotelMiddleware, fetchHotel, addHotelImageMiddleware, fetchHotelImage, deleteHotelImageMiddleware, editHotelmiddleware } from "../middleware/hotel.middleware";
import appDataSource from '../ormconfig'


let addHotel = async (req: Request, res: Response) => {
    try {
        let { name, description, city, stars }: { name: string, description: string, city: string, stars: number } = req.body
        await addHotelMiddleware(city, name, description, stars)
        res.json({ msg: "hotel added" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not add hotel" })
    }
}

let addHotelImage = async (req: Request, res: Response) => {
    try {
        let hotel = await fetchHotel(req.params.id)
        if ( !hotel ) throw new Error("something went wrong")
        await addHotelImageMiddleware(req.file?.path!, hotel)
        res.json({ msg: "image added" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not add image" })
    }
}

let deleteHotelImage = async (req: Request, res: Response) => {
    try {
        let hotel = await fetchHotel(req.params.hotelId, { images: true })
        let image = await fetchHotelImage(req.params.imageId)
        if ( !hotel || !image || !(hotel.images.some((hotelImage) => hotelImage.id == image?.id))) throw new Error("something went wrong")
        //deleting
        await deleteHotelImageMiddleware(image)
        res.json({ msg: "image deleted" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "something went wrong" })
    }
}

let deleteHotel = async (req: Request, res: Response) => {
    try {
        let hotelToDelete = await fetchHotel(req.params.id, { images: true })
        if (!hotelToDelete) throw new Error("something went wrong")
        await hotelToDelete.images.forEach(async (image) => await deleteHotelImageMiddleware(image))
        await appDataSource.manager.remove(hotelToDelete)
        res.json({ msg: "hotel deleted successfuly" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not delete hotel" })
    }
}

let editHotel = async (req: Request, res: Response) => {
    try {
        let hotelToEdit = await fetchHotel(req.params.id)
        if ( !hotelToEdit ) throw new Error("something went wrong")
        let { newname, newcity, newDescription, newStars }: { newname: string, newcity: string, newDescription: string, newStars: number } = req.body
        await editHotelmiddleware(hotelToEdit, newname, newcity, newDescription, newStars)
        res.json({ msg: "hotel edited" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not edit hotel" })
    }
}

export {
    addHotel,
    addHotelImage,
    deleteHotelImage,
    deleteHotel,
    editHotel
}
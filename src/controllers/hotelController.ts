import { Request, Response } from "express";
import appDataSource from '../ormconfig'
import { addHotelImageMiddleware, addHotelMiddleware, deleteHotelImageMiddleware, editHotelmiddleware, fetchHotel, fetchHotelImage } from "../middleware/hotel.middleware";


let addHotel = (req: Request, res: Response) => {
    try {
        let { name, description, city }: { name: string, description: string, city: string } = req.body
        addHotelMiddleware(city, name, description)
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
        addHotelImageMiddleware(req.file?.path!, hotel)
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
        deleteHotelImageMiddleware(image)
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
        hotelToDelete.images.forEach((image) => deleteHotelImageMiddleware(image))
        appDataSource.manager.remove(hotelToDelete)
        res.json({ msg: "hotel deleted successfuly" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not delete dest" })
    }
}

let editHotel = async (req: Request, res: Response) => {
    try {
        let hotelToEdit = await fetchHotel(req.params.id)
        if ( !hotelToEdit ) throw new Error("something went wrong")
        let { newname, newcity, newDescription }: { newname: string, newcity: string, newDescription: string } = req.body
        editHotelmiddleware(hotelToEdit, newname, newcity, newDescription)
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
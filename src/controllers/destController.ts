import { Request, Response } from "express";
import { addDestImageMiddleware, addDestMiddleware, deleteDestImageMiddleware, editDestmiddleware, fetchDest, fetchDestImage } from "../middleware/dest.middleware";
import appDataSource from '../ormconfig'


let addDestination = async (req: Request, res: Response) => {
    try {
        let { name, description, city, type }: { name: string, description: string, city: string, type: string } = req.body
        await addDestMiddleware(city, name, description, type)
        res.json({ msg: "destination added" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not add destination" })
    }
}

let addDestImage = async (req: Request, res: Response) => {
    try {
        let dest = await fetchDest(req.params.id)
        if ( !dest ) throw new Error("something went wrong")
        await addDestImageMiddleware(req.file?.path!, dest)
        res.json({ msg: "image added" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not add image" })
    }
}

let deleteDestImage = async (req: Request, res: Response) => {
    try {
        let dest = await fetchDest(req.params.destId, { images: true })
        let image = await fetchDestImage(req.params.imageId)
        if ( !dest || !image || !(dest.images.some((destImage) => destImage.id == image?.id))) throw new Error("something went wrong")
        //deleting
        await deleteDestImageMiddleware(image)
        res.json({ msg: "image deleted" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "something went wrong" })
    }
}

let deleteDest = async (req: Request, res: Response) => {
    try {
        let destToDelete = await fetchDest(req.params.id, { images: true })
        if (!destToDelete) throw new Error("something went wrong")
        await destToDelete.images.forEach(async (image) => await deleteDestImageMiddleware(image))
        await appDataSource.manager.remove(destToDelete)
        res.json({ msg: "dest deleted successfuly" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not delete dest" })
    }
}

let editDest = async (req: Request, res: Response) => {
    try {
        let destToEdit = await fetchDest(req.params.id)
        if ( !destToEdit ) throw new Error("something went wrong")
        let { newname, newcity, newDescription, newType }: { newname: string, newcity: string, newDescription: string, newType: string } = req.body
        await editDestmiddleware(destToEdit, newname, newcity, newDescription, newType)
        res.json({ msg: "destination edited" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not edit destination" })
    }
}

export {
    addDestination,
    addDestImage,
    deleteDestImage,
    deleteDest,
    editDest
}
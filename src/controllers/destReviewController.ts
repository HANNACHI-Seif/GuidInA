import { Request, Response } from "express"
import { fetchDest } from "../middleware/dest.middleware"
import appDataSource from "../ormconfig"
import Dest_Review from "../entities/dest_review"
import { addDestReviewMiddleware, editDestReviewMiddleware, fetchDestReview, updateDestReview } from "../middleware/destReview.middleware"
import roles from "../constants/roles"


let addDestinationReview = async (req: Request, res: Response) => {
    try {
        let user = req.user!
        let ratedDest = await fetchDest(req.params.id)
        let reviewed = await appDataSource
            .getRepository(Dest_Review)
                .createQueryBuilder('dest_review')
                    .where('dest_review.userId = :userId', { userId: user.id })
                        .andWhere('dest_review.destinationId = :destId', { destId: req.params.id })
                            .getOne()
        if (!ratedDest || reviewed ) throw new Error("something went wrong")
        let { text, stars }: { text: string, stars: number } = req.body
        if (stars > 5 || stars < 1) throw new Error("unvalid input")
        await addDestReviewMiddleware(text, stars, ratedDest, user)
        await updateDestReview(ratedDest)
        res.json({ msg: "review added" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not add a review" })
    }
}

let fetchDestReviews = async (req: Request, res: Response) => {
    try {
        let destReviews = await appDataSource.getRepository(Dest_Review)
            .createQueryBuilder("dest_review")
                .select("dest_review")
                    .where("dest_review.destinationId=:id", {id: req.params.id})
                        .getMany();
        res.json({ destReviews })
    } catch (error) {
        console.log(error)
        res.json({ msg: "failed to fetch dest reviews" })
    }
}

let deleteDestinationReview = async (req: Request, res: Response) => {
    try {
        let user = req.user!
        let reviewToDelete = await fetchDestReview(req.params.id, { destination: true, user: true })
        if (!reviewToDelete) throw new Error("something went wrong")
        if ( user.role !== roles.ADMIN && user.id !== reviewToDelete.user.id ) throw new Error("unauthorized")
        await appDataSource.manager.remove(reviewToDelete)
        await updateDestReview(reviewToDelete.destination)
        res.json({ msg: "deleted a review" })
    } catch (error) {
        console.log(error)
        res.json({ msg: error.message })
    }
}

let editDestReview = async (req: Request, res: Response) => {
    try {
        let ReviewToEdit = await appDataSource.getRepository(Dest_Review)
            .createQueryBuilder("dest_review")
            //.select(["dest_review.destination", "dest_review.id", "dest_review.text"]) how to select only certain fields
                .leftJoinAndSelect("dest_review.destination","destination")
                    .where("dest_review.userId = :userId", { userId: req.user!.id })
                        .andWhere("dest_review.id = :reviewId", { reviewId: req.params.id })
                            .getOne()
        if (!ReviewToEdit) throw new Error("something went wrong")
        let { newText, newStars }: { newText: string, newStars: number } = req.body
        if (newStars) if (newStars > 5 || newStars < 1) throw new Error("unvalid input")
        await editDestReviewMiddleware(newText, newStars, ReviewToEdit)
        if (newStars) await updateDestReview(ReviewToEdit.destination)
        res.json({ msg: "edited successfuly" })
    } catch (error) {
        console.log(error)
        res.json({ msg: error.message })
    }
}

export {
    addDestinationReview,
    deleteDestinationReview,
    fetchDestReviews,
    editDestReview
}
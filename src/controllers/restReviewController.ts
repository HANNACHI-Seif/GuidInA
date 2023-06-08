import { Request, Response } from "express"
import appDataSource from "../ormconfig"
import roles from "../constants/roles"
import { fetchRestaurant } from "../middleware/restaurant.middleware"
import Rest_Review from "../entities/rest_review"
import { addRestReviewMiddleware, editRestReviewMiddleware, fetchRestReview, updateRestReview } from "../middleware/restReview.middleware"


let addRestReview = async (req: Request, res: Response) => {
    try {
        let user = req.user!
        let ratedRestaurant = await fetchRestaurant(req.params.id)
        let reviewed = await appDataSource
            .getRepository(Rest_Review)
                .createQueryBuilder('rest_review')
                    .where('rest_review.userId = :userId', { userId: user.id })
                        .andWhere('rest_review.restaurantId = :restaurantId', { restaurantId: req.params.id })
                            .getOne()
        if ( !ratedRestaurant ) throw new Error("something went wrong")
        if ( reviewed ) throw new Error("you already reviewed this restaurant")
        let { text, stars }: { text: string, stars: number } = req.body
        if (stars > 5 || stars < 1) throw new Error("unvalid input")
        await addRestReviewMiddleware(text, stars, ratedRestaurant, user)
        await updateRestReview(ratedRestaurant)
        res.json({ msg: "review added" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not add a review" })
    }
}

let fetchRestReviews = async (req: Request, res: Response) => {
    try {
        let restReviews = await appDataSource.getRepository(Rest_Review)
            .createQueryBuilder("rest_review")
                .select("rest_review")
                    .where("rest_review.restaurantId = :id", {id: req.params.id})
                        .getMany();
        res.json({ restReviews })
    } catch (error) {
        console.log(error)
        res.json({ msg: "failed to fetch restaurant reviews" })
    }
}

let deleteRestReview = async (req: Request, res: Response) => {
    try {
        let user = req.user!
        let reviewToDelete = await fetchRestReview(req.params.id, { user: true, restaurant: true })
        if (!reviewToDelete) throw new Error("something went wrong")
        let isAdmin = req.user?.roles.some(role => role.roleName == roles.ADMIN)
        if ( !isAdmin && user.id !== reviewToDelete.user.id ) throw new Error("unauthorized")
        await appDataSource.manager.remove(reviewToDelete)
        await updateRestReview(reviewToDelete.restaurant)
        res.json({ msg: "deleted a review" })
    } catch (error) {
        console.log(error)
        res.json({ msg: error.message })
    }
}

let editRestReview = async (req: Request, res: Response) => {
    try {
        let ReviewToEdit = await appDataSource.getRepository(Rest_Review)
            .createQueryBuilder("rest_review")
                .leftJoinAndSelect("rest_review.restaurant","restaurant")
                    .where("rest_review.userId = :userId", { userId: req.user!.id })
                        .andWhere("rest_review.id = :reviewId", { reviewId: req.params.id })
                            .getOne()
        if (!ReviewToEdit) throw new Error("something went wrong")
        let { newText, newStars }: { newText: string, newStars: number } = req.body
        if (newStars) if (newStars > 5 || newStars < 1) throw new Error("unvalid input")
        await editRestReviewMiddleware(newText, newStars, ReviewToEdit)
        if (newStars) await updateRestReview(ReviewToEdit.restaurant)
        res.json({ msg: "edited successfuly" })
    } catch (error) {
        console.log(error)
        res.json({ msg: error.message })
    }
}

export {
    addRestReview,
    fetchRestReviews,
    deleteRestReview,
    editRestReview
}


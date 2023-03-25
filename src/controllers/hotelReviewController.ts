import { Request, Response } from "express"
import appDataSource from "../ormconfig"
import roles from "../constants/roles"
import { fetchHotel } from "../middleware/hotel.middleware"
import Hotel_Review from "../entities/hotel_review"
import { addHotelReviewMiddleware, editHotelReviewMiddleware, fetchHotelReview, updateHotelReview } from "../middleware/hotelReview.middleware"


let addHotelReview = async (req: Request, res: Response) => {
    try {
        let user = req.user!
        let ratedHotel = await fetchHotel(req.params.id)
        let reviewed = await appDataSource
            .getRepository(Hotel_Review)
                .createQueryBuilder('hotel_review')
                    .where('hotel_review.userId = :userId', { userId: user.id })
                        .andWhere('hotel_review.hotelId = :hotelId', { hotelId: req.params.id })
                            .getOne()
        if ( !ratedHotel ) throw new Error("something went wrong")
        if ( reviewed ) throw new Error("you already reviewed this hotel")
        let { text, stars }: { text: string, stars: number } = req.body
        if (stars > 5 || stars < 1) throw new Error("unvalid input")
        await addHotelReviewMiddleware(text, stars, ratedHotel, user)
        await updateHotelReview(ratedHotel)
        res.json({ msg: "review added" })
    } catch (error) {
        console.log(error)
        res.json({ msg: "could not add a review" })
    }
}

let fetchHotelReviews = async (req: Request, res: Response) => {
    try {
        let hotelReviews = await appDataSource.getRepository(Hotel_Review)
            .createQueryBuilder("hotel_review")
                .select("hotel_review")
                    .where("hotel_review.hotelId = :id", {id: req.params.id})
                        .getMany();
        res.json({ hotelReviews })
    } catch (error) {
        console.log(error)
        res.json({ msg: "failed to fetch hotel reviews" })
    }
}

let deleteHotelReview = async (req: Request, res: Response) => {
    try {
        let user = req.user!
        let reviewToDelete = await fetchHotelReview(req.params.id, { user: true, hotel: true })
        if (!reviewToDelete) throw new Error("something went wrong")
        if ( user.role !== roles.ADMIN && user.id !== reviewToDelete.user.id ) throw new Error("unauthorized")
        await appDataSource.manager.remove(reviewToDelete)
        await updateHotelReview(reviewToDelete.hotel)
        res.json({ msg: "deleted a review" })
    } catch (error) {
        console.log(error)
        res.json({ msg: error.message })
    }
}

let editHotelReview = async (req: Request, res: Response) => {
    try {
        let userId = req.user!.id
        let reviewId = req.params.id
        let ReviewToEdit = await appDataSource.getRepository(Hotel_Review)
            .createQueryBuilder("hotel_review")
                .leftJoinAndSelect("hotel_review.hotel","hotel")
                    .where("hotel_review.userId = :userId", { userId: userId })
                        .andWhere("hotel_review.id = :reviewId", { reviewId: reviewId })
                            .getOne()
        if (!ReviewToEdit) throw new Error("something went wrong")
        let { newText, newStars }: { newText: string, newStars: number } = req.body
        if (newStars) if (newStars > 5 || newStars < 1) throw new Error("unvalid input")
        await editHotelReviewMiddleware(newText, newStars, ReviewToEdit)
        if (newStars) await updateHotelReview(ReviewToEdit.hotel)
        res.json({ msg: "edited successfuly" })
    } catch (error) {
        console.log(error)
        res.json({ msg: error.message })
    }
}

export {
    addHotelReview,
    fetchHotelReviews,
    deleteHotelReview,
    editHotelReview
}
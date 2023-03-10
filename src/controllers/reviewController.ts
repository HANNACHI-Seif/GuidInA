import { Request, Response } from "express"
import roles from "../constants/roles"
import { addReviewMiddleware, fetchReview, updateUserReviews } from "../middleware/review.middleware"
import { fetchUser } from "../middleware/user.middleware"
import appDataSource from "../ormconfig"
import User_review from "../entities/user_review"

let addReview = async (req: Request, res: Response) => {
    try {
        let user = req.user!
        let ratedUser = await fetchUser(req.params.id)
        let userId = user!.id
        let reviewed = await appDataSource.getRepository(User_review).createQueryBuilder('user_review').leftJoinAndSelect('user_review.ratedUser', 'ratedUser').where('user_review.userId = :userId', { userId }).getOne()
        if (!ratedUser || ratedUser.role == roles.TOURIST || reviewed || user.id == req.params.id ) throw new Error("something went wrong")
        let {text, stars}: {text: string, stars: number} = req.body
        if (stars > 5 || stars < 1) throw new Error("unvalid input")
        await addReviewMiddleware(text, stars, ratedUser!, user!)
        await updateUserReviews(ratedUser!.id)
        res.json({ msg: "successfuly added a review" })
    } catch (error) {
        console.log(error)
        res.json({ msg: error.message })
    }
}

let fetchUserRevivews = async (req: Request, res: Response) => {
    try {
        let ratedUser = await fetchUser(req.params.id, { myReviews: true })
        if (!ratedUser) throw new Error("something went wrong")
        res.json({ reviews: ratedUser.myReviews })
    } catch (error) {
        console.log(error)
        res.json({ msg: error })
    }
}

let deleteReview = async (req: Request, res: Response) => {
    try {
        let user = req.user!
        let reviewToDelete = await fetchReview(req.params.id, { ratedUser: true, user: true })
        if ( !reviewToDelete ) throw new Error("something went wrong")
        if (user.role !== roles.ADMIN && user.id !== reviewToDelete?.user.id) throw new Error("unauthorized")
        await appDataSource.manager.remove(reviewToDelete)
        await updateUserReviews(reviewToDelete!.ratedUser.id)
        res.json({ msg: "review deleted" })
    } catch (error) {
        console.log(error.message)
        res.json({ msg: error.message })
    }
}



export {
    addReview,
    fetchUserRevivews,
    deleteReview
}
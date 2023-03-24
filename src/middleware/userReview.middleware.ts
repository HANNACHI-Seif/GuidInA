import User_review from "../entities/user_review"
import User from "../entities/user"
import appDataSource from '../ormconfig'
import { fetchUser } from "./user.middleware"
import { Decimal } from "decimal.js"


let addUserReviewMiddleware = async (text: string, stars: number, ratedUser: User, user: User) => {
    let userReviewRepo = appDataSource.getRepository(User_review)
    let newReview = new User_review()
    newReview.text = text
    newReview.stars = stars
    newReview.user = user
    newReview.ratedUser = ratedUser
    await userReviewRepo.save(newReview)
}

let fetchUserReview = (id: string, obj = {}) => {
    let userReviewRepo = appDataSource.getRepository(User_review)
    return userReviewRepo.findOne({ where: { id: id }, relations: obj })
}

let updateUserReviews = async (userToUpdate: User) => {
    let avg = await appDataSource.getRepository(User_review).createQueryBuilder('user_review').select('AVG(user_review.stars)', 'average').where('user_review.ratedUserId = :ratedUserId', { ratedUserId: userToUpdate.id }).getRawOne();
    if (avg.average) {
        userToUpdate!.rating = avg.average
        appDataSource.manager.save(userToUpdate)
    } else {
        userToUpdate!.rating = new Decimal(0)
        appDataSource.manager.save(userToUpdate)
    }
    
}

let editUserReviewMiddleware = async (newText: string, newStars: number, userReviewToEdit: User_review) => {
    if (newText) userReviewToEdit.text = newText
    if (newStars) userReviewToEdit.stars = newStars
    await appDataSource.manager.save(userReviewToEdit)
}

export {
    addUserReviewMiddleware,
    fetchUserReview,
    updateUserReviews,
    editUserReviewMiddleware
}
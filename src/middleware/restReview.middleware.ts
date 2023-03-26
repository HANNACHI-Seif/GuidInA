import Restaurant from "../entities/restaurant"
import Rest_Review from "../entities/rest_review"
import User from "../entities/user"
import appDataSource from '../ormconfig'
import { Decimal } from "decimal.js"




let addRestReviewMiddleware = async (text: string, stars: number, ratedRestaurant: Restaurant, user: User) => {
    let restReviewRepo = appDataSource.getRepository(Rest_Review)
    let newReview = new Rest_Review()
    newReview.text = text
    newReview.stars = stars
    newReview.user = user
    newReview.restaurant = ratedRestaurant
    await restReviewRepo.save(newReview)
}

let fetchRestReview = (id: string, obj={}) => {
    let restReviewRepo = appDataSource.getRepository(Rest_Review)
    return restReviewRepo.findOne({ where: { id: id }, relations: obj })
}

let updateRestReview = async (restToUpdate: Restaurant) => {
    let avg = await appDataSource.getRepository(Rest_Review)
        .createQueryBuilder('rest_review')
            .select('AVG(rest_review.stars)', 'average')
                .where('rest_review.restaurantId = :restaurantId', { restaurantId: restToUpdate.id })
                    .getRawOne();
    if (avg.average) {
        restToUpdate!.rating = avg.average
        appDataSource.manager.save(restToUpdate)
    } else {
        restToUpdate!.rating = new Decimal(0)
        appDataSource.manager.save(restToUpdate)
    }
}

let editRestReviewMiddleware = async (newText: string, newStars: number, ReviewToEdit: Rest_Review) => {
    if (newText) ReviewToEdit.text = newText
    if (newStars) ReviewToEdit.stars = newStars
    await appDataSource.manager.save(ReviewToEdit)
}

export {
    addRestReviewMiddleware,
    updateRestReview,
    fetchRestReview,
    editRestReviewMiddleware
}
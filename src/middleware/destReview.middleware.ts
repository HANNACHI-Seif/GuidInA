import Dest_Review from "../entities/dest_review"
import Destination from "../entities/destination"
import User from "../entities/user"
import appDataSource from '../ormconfig'
import { Decimal } from "decimal.js"




let addDestReviewMiddleware = async (text: string, stars: number, ratedDest: Destination, user: User) => {
    let destReviewRepo = appDataSource.getRepository(Dest_Review)
    let newReview = new Dest_Review()
    newReview.text = text
    newReview.stars = stars
    newReview.user = user
    newReview.destination = ratedDest
    await destReviewRepo.save(newReview)
}

let fetchDestReview = (id: string, obj={}) => {
    let destReviewRepo = appDataSource.getRepository(Dest_Review)
    return destReviewRepo.findOne({ where: { id: id }, relations: obj })
}

let updateDestReview = async (DestToUpdate: Destination) => {
    let avg = await appDataSource.getRepository(Dest_Review).createQueryBuilder('dest_review').select('AVG(dest_review.stars)', 'average').where('dest_review.destination = :destinationId', { destinationId: DestToUpdate.id }).getRawOne();
    if (avg.average) {
        DestToUpdate!.rating = avg.average
        appDataSource.manager.save(DestToUpdate)
    } else {
        DestToUpdate!.rating = new Decimal(0)
        appDataSource.manager.save(DestToUpdate)
    }
}

let editDestReviewMiddleware = async (newText: string, newStars: number, ReviewToEdit: Dest_Review) => {
    if (newText) ReviewToEdit.text = newText
    if (newStars) ReviewToEdit.stars = newStars
    await appDataSource.manager.save(ReviewToEdit)
}

export {
    addDestReviewMiddleware,
    fetchDestReview,
    updateDestReview,
    editDestReviewMiddleware
}
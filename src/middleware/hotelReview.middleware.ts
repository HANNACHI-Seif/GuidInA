import Hotel_Review from "../entities/hotel_review"
import Hotel from "../entities/hotel"
import User from "../entities/user"
import appDataSource from '../ormconfig'
import { Decimal } from "decimal.js"




let addHotelReviewMiddleware = async (text: string, stars: number, ratedHotel: Hotel, user: User) => {
    let destReviewRepo = appDataSource.getRepository(Hotel_Review)
    let newReview = new Hotel_Review()
    newReview.text = text
    newReview.stars = stars
    newReview.user = user
    newReview.hotel = ratedHotel
    await destReviewRepo.save(newReview)
}

let fetchHotelReview = (id: string, obj={}) => {
    let hotelReviewRepo = appDataSource.getRepository(Hotel_Review)
    return hotelReviewRepo.findOne({ where: { id: id }, relations: obj })
}

let updateHotelReview = async (hotelToUpdate: Hotel) => {
    let avg = await appDataSource.getRepository(Hotel_Review)
        .createQueryBuilder('hotel_review')
            .select('AVG(hotel_review.stars)', 'average')
                .where('hotel_review.hotelId = :hotelId', { hotelId: hotelToUpdate.id })
                    .getRawOne();
    if (avg.average) {
        hotelToUpdate!.rating = avg.average
        appDataSource.manager.save(hotelToUpdate)
    } else {
        hotelToUpdate!.rating = new Decimal(0)
        appDataSource.manager.save(hotelToUpdate)
    }
}

let editHotelReviewMiddleware = async (newText: string, newStars: number, ReviewToEdit: Hotel_Review) => {
    if (newText) ReviewToEdit.text = newText
    if (newStars) ReviewToEdit.stars = newStars
    await appDataSource.manager.save(ReviewToEdit)
}

export {
    addHotelReviewMiddleware,
    updateHotelReview,
    fetchHotelReview,
    editHotelReviewMiddleware
}
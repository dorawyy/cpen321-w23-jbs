const db = require("../db")

const User = db.user


exports.getOverallRating = (userReviews) => {
    if (userReviews.length == 0) {
        return 0
    }
    var sum = 0
    for (reviews of userReviews) {
        sum += reviews.rating
    }
    return sum/userReviews.length
}
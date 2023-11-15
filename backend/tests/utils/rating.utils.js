function mockGetOverallRating(userReviews) {
    if (userReviews.length === 0) {
        return 0
    }
    var sum = 0
    for (var reviews of userReviews) {
        sum += reviews.rating
    }
    return sum/userReviews.length
}

function mockGetTop2Ratings(userReviews) {
    var ratings = userReviews
    ratings.sort((fb1, fb2) => fb2.rating - fb1.rating)

    var top2Ratings
    if (ratings.length <= 2) {
        top2Ratings = ratings
    } else {
        top2Ratings = ratings.slice(0, 3)
    }
    return top2Ratings
}

module.exports = {
    mockGetOverallRating,
    mockGetTop2Ratings
}
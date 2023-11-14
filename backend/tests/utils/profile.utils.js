const MOCK_EXCLUDED_FIELDS = [
    "-_id",
    "-googleId",
    "-password",
    "-googleOauth",
    "-recommendationWeights",
    "-hasSignedUp"
]

function filterOutExcludedFields(data, excludedFieldList) {
    if (!excludedFieldList) {
        excludedFieldList = MOCK_EXCLUDED_FIELDS
    }
    var expectedData = {}
    for (var key of Object.keys(data)) {
        if (!excludedFieldList.includes(`-${key}`)) {
            expectedData[key] = data[key]
        }
    }
    return expectedData
}

module.exports = {
    filterOutExcludedFields
}
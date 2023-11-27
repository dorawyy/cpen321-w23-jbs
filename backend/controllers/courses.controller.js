const axios = require("axios")

const API_URL =  "https://ubcgrades.com/api/v3"

// ChatGPT usage: No
exports.getCourseCodes = async (req, res) => {
    var code = req.query.code
    if (!code) {
        return res.status(400).send({ message: "code is required" })
    }
    var courseCode
    if (code.length > 4) {
        courseCode = code.slice(4).trim()
        code = code.slice(0, 4)
    }
    axios.get(`${API_URL}/courses/UBCV/${code}`)
            .then((result) => {
                var data = result.data
                if (courseCode) {
                    data = data.filter(info => info.course.startsWith(courseCode))
                }
                data = data.map(info => {
                    return {
                        code: `${code} ${info.course}`,
                        title: info.course_title
                    }
                })
                var ret = {
                    courses: data
                }
                return res.status(200).send(ret)
            }).catch(err => {
                console.log(err)
                return res.status(200).send({
                    courses: []
                })
            })

}

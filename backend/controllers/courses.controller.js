const axios = require("axios")

const API_URL =  "https://ubcgrades.com/api/v3"

// ChatGPT usage: No
exports.getCourseCodes = async (req, res) => {
    const code = req.query.code
    if (!code) {
        return res.status(400).send({ message: "code is required" })
    }
    axios.get(`${API_URL}/courses/UBCV/${code}`)
            .then((result) => {
                var data = result.data
                data = data.map(info => `${code} ${info.course}`)
                var ret = {
                    courses: data
                }
                return res.status(200).send(ret)
            }).catch(err => {
                console.log(err)
                return res.status(500).send({ message: err.message })
            })

}

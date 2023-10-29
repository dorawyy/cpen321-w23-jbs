const axios = require("axios")

const API_URL = "https://ubcexplorer.io"

exports.getCourseCodes = async (req, res) => {
    const code = req.query.code
    axios.get(`${API_URL}/searchAny/${code}`)
            .then((result) => {
                var data = result.data
                data = data.map(info => info.code)
                return res.status(200).send(data)
            })
            .catch(err => {
                console.log(err)
                return res.status(500).send({
                    message: err.message
                })
            })
}

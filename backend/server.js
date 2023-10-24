const express = require("express");
const path = require("path")
require('dotenv').config({ path: path.join(__dirname, '.env') })
const http = require("http")
const https = require("https")
const fs = require("fs")
const db = require("./db")
const authRoutes = require("./routes/auth.routes")
const recommendationRoutes = require("./routes/recommendation.routes")
const browseRoutes = require("./routes/browse.routes")

const mongoUrl = process.env.MONGODB_URI
const env = process.env.ENV
PORT = 80

db.mongoose
    .connect(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Successfully connected to MongoDB")
    })
    .catch(err => {
        console.error("Connection error", err)
        process.exit()
    })

const app = express();

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname, { dotfiles: 'allow' } ));

authRoutes(app)
recommendationRoutes(app)
browseRoutes(app)

if (env === 'prod') {
    // PRODUCTION
    const privateKeyFile = "/etc/letsencrypt/live/edumatch.canadacentral.cloudapp.azure.com/privkey.pem"
    const certFile = "/etc/letsencrypt/live/edumatch.canadacentral.cloudapp.azure.com/fullchain.pem"
    const chainFile = "/etc/letsencrypt/live/edumatch.canadacentral.cloudapp.azure.com/chain.pem"

    const privateKey = fs.readFileSync(privateKeyFile, 'utf8');
    const certificate = fs.readFileSync(certFile, 'utf8');
    const ca = fs.readFileSync(chainFile, 'utf8');

    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };
    // Starting both http & https servers
    const httpServer = http.createServer(app);
    const httpsServer = https.createServer(credentials, app);

    httpServer.listen(80, () => {
        console.log('HTTP Server running on port 80');
    });

    httpsServer.listen(443, () => {
        console.log('HTTPS Server running on port 443');
    });
} else {
    // LOCAL
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} locally.`);
    });
}
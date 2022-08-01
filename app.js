require("dotenv").config()
const express = require("express")
const app = express()

// Setup your Middleware and API Router here
const morgan = require('morgan')
app.use(morgan('dev'))

const bodyParser = require('body-parser')
app.use(bodyParser.json())

const cors = require('cors')
app.use(cors())

app.use(express.json())

app.use(express.urlencoded({extended: true}))

const apiRouter = require('./api')
app.use('/api', apiRouter)

apiRouter.use("/unknown", (req, res) => {
    res.status(404).send( { message: "Page not found." })
})

apiRouter.use(function(error, req, res) {
    res.status(error.status || 403).send({
        error: error.message,
        message: error.message,
        name: error.name
    })
})

module.exports = app;
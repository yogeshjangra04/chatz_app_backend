const User = require('../models/User')
const jwt = require('jsonwebtoken')
const errorHandler = require('express-async-handler')

const authenticateUser = errorHandler(async (req, res, next) => {
    //check header

    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401)
        throw new Error('Bearer Authorisation missing!')
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
        res.status(401)
        throw new Error('No token provided')
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        //attach the user to the routes
        req.user = await User.findById(payload.userId).select("-password")
        next()

    } catch (error) {
        res.status(401)
        throw new Error('Token could not be verified!')
    }

})

module.exports = authenticateUser
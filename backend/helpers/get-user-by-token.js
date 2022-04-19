const jwt = require('jsonwebtoken')

const User = require('../models/User')

const getUserByToken = async (token) => {
    const decoded = jwt.verify(token, process.env.JWTSECRET)
    const userId = decoded.id
    const user = await User.findById(userId)
    return user
}

module.exports = getUserByToken
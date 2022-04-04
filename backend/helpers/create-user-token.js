const jwt = require('jsonwebtoken')
const status = require('./http-status')

const createUserToken = async (user, req, res) => {
    const token = jwt.sign({
        name: user.name,
        id: user._id
    }, process.env.JWTSECRET)

    res.status(status.ok).json({
        message: 'Você está autenticado',
        token: token,
        userId: user._id
    })
}

module.exports = createUserToken
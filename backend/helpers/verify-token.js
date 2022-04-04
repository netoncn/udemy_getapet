const jwt = require('jsonwebtoken')
const getToken = require('./get-token')
const status = require('./http-status')

const checkToken = (req, res, next) => {
    const token = getToken(req)

    if(!token) {
        return res.status(status.unauthorized).json({ message: 'Acesso Negado!' })
    }

    try {
        const verified = jwt.verify(token, process.env.JWTSECRET)
        req.user = verified
        next()
    } catch (error) {
        return res.status(status.bad_request).json({ message: 'Token inválido!' })
    }
}

module.exports = checkToken